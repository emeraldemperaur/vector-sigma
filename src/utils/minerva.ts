import { XFormType, XFormQuery } from "./voltron";

/**
 * Utility to convert string to camelCase (e.g., "USER NAME" -> "userName", "user_profile" -> "userProfile")
 * Safely handles ALL CAPS, snake_case, spaces, and existing camelCase.
 */
const toCamelCase = (str: string): string => {
  if (!str) return "";
  
  const words = str
    .replace(/([a-z])([A-Z])/g, '$1 $2') // Split existing camelCase with a space
    .replace(/[^a-zA-Z0-9]+/g, ' ')      // Replace non-alphanumeric characters with spaces
    .trim()
    .toLowerCase()                       // Lowercase everything
    .split(/\s+/);                       // Split into an array of words
    
  if (words.length === 0 || words[0] === '') return "";
  
  return words.map((word, index) => {
    if (index === 0) return word; // First word stays lowercase
    return word.charAt(0).toUpperCase() + word.slice(1); // Capitalize subsequent words
  }).join('');
};

/**
 * Utility to convert string to kebab-case (e.g., "Profile Section" -> "profile-section")
 * Ensures code-friendly standard strings.
 */
const toKebabCase = (str: string): string => {
  if (!str) return "";
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2') // 1. Handle camelCase inputs
    .replace(/[^a-zA-Z0-9]+/g, '-')      // 2. Replace non-alphanumeric chars with hyphens
    .toLowerCase()                       // 3. Lowercase everything
    .replace(/^-+|-+$/g, '');            // 4. Trim any leading or trailing hyphens
};

/**
 * Normalizes and sanitizes an XFormType object.
 * - Standardizes Section IDs.
 * - Enforces globally consecutive Query IDs.
 * - Ensures unique, Formik-friendly camelCase Input Aliases.
 * - Prevents empty string values in Input Options (Fixes Radix UI crashes).
 */
export const normalizeXForm = (form: XFormType): XFormType => {
  // Deep clone the object to prevent mutating the original data reference
  const normalizedForm: XFormType = JSON.parse(JSON.stringify(form));

  if (!normalizedForm.model || normalizedForm.model.length === 0) {
    return normalizedForm;
  }

  // ==========================================
  //  SECTION ID NORMALIZATION
  // ==========================================
  const firstSectionId = normalizedForm.model[0].sectionId;
  const isFirstSectionNumbered = !isNaN(Number(firstSectionId)) && String(firstSectionId).trim() !== '';
  
  let sectionCounter = isFirstSectionNumbered ? Number(firstSectionId) : 1;

  normalizedForm.model.forEach((section) => {
    if (isFirstSectionNumbered) {
      section.sectionId = String(sectionCounter++);
    } else {
      section.sectionId = toKebabCase(section.sectionId) || `section-${sectionCounter++}`;
    }
  });


  // ==========================================
  //  QUERY ID, ALIAS, & OPTIONS NORMALIZATION
  // ==========================================
  const aliasTracker: Record<string, number> = {};
  let undefinedCounter = 1;
  
  let globalQueryId = 1;
  const firstQuery = normalizedForm.model[0]?.queries?.[0];
  if (firstQuery && typeof firstQuery.queryId === 'number' && !isNaN(firstQuery.queryId)) {
      globalQueryId = firstQuery.queryId;
  }

  const processQuery = (query: XFormQuery) => {
    
    query.queryId = globalQueryId++;

    let baseAlias = toCamelCase(query.inputAlias);
    
    if (!baseAlias) {
      let potentialAlias = `undefinedElement${undefinedCounter}`;
      while (aliasTracker[potentialAlias]) {
        undefinedCounter++;
        potentialAlias = `undefinedElement${undefinedCounter}`;
      }
      query.inputAlias = potentialAlias;
      aliasTracker[potentialAlias] = 1; 
      undefinedCounter++;
    } 
    else {
      if (aliasTracker[baseAlias]) {
        aliasTracker[baseAlias]++;
        query.inputAlias = `${baseAlias}${aliasTracker[baseAlias]}`;
      } else {
        aliasTracker[baseAlias] = 1;
        query.inputAlias = baseAlias;
      }
    }

    if (query.inputOptions && Array.isArray(query.inputOptions)) {
      query.inputOptions.forEach((option) => {
        if (
          option.optionvalue == null || 
          (typeof option.optionvalue === 'string' && option.optionvalue.trim() === '')
        ) {
          option.optionvalue = `__empty_${option.optionid}`;
        }
      });
    }

    if (query.toggledInput) {
      processQuery(query.toggledInput);
    }
  };

  normalizedForm.model.forEach((section) => {
    if (section.queries && Array.isArray(section.queries)) {
      section.queries.forEach((query) => {
        processQuery(query);
      });
    }
  });

  return normalizedForm;
};