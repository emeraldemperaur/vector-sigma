import { XFormType, XFormQuery } from "./voltron";

/**
 * Utility to convert any string to camelCase (e.g., "USER NAME" -> "userName", "user_profile" -> "userProfile")
 * Safely handles ALL CAPS, snake_case, spaces, and existing camelCase.
 * @param str - String to convert to camelCase format
 */
const toCamelCase = (str: string): string => {
  if (!str) return "";
  
  const words = str
    .replace(/([a-z])([A-Z])/g, '$1 $2') // 1. Split existing camelCase with a space
    .replace(/[^a-zA-Z0-9]+/g, ' ')      // 2. Replace non-alphanumeric characters with spaces
    .trim()
    .toLowerCase()                       // 3. Lowercase everything
    .split(/\s+/);                       // 4. Split into an array of words
    
  if (words.length === 0 || words[0] === '') return "";
  
  return words.map((word, index) => {
    if (index === 0) return word; // First word stays lowercase
    return word.charAt(0).toUpperCase() + word.slice(1); // Capitalize subsequent words
  }).join('');
};

/**
 * Utility to convert a string to kebab-case (e.g., "Profile Section" -> "profile-section")
 * Ensures code-friendly standard strings.
 * @param str - String to convert to kebab-case format
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
 * - Standardizes Section IDs (Consecutive numbers or code-friendly strings).
 * - Enforces globally consecutive Query IDs.
 * - Ensures unique, Formik-friendly camelCase Input Aliases.
 * - Auto-fills empty inputAliases with unique 'undefinedElement[N]' placeholder.
 * @param xform - xForm object {} to normalize `sectionId`, `queryId` and `inputAlias` attributes for `<Teletraan1/>` component
 */
export const normalizeXForm = (xform: XFormType): XFormType => {
  // Deep clone the object to prevent mutating the original data reference
  const normalizedForm: XFormType = JSON.parse(JSON.stringify(xform));

  if (!normalizedForm.model || normalizedForm.model.length === 0) {
    return normalizedForm;
  }

  // ==========================================
  // 1. SECTION ID NORMALIZATION
  // ==========================================
  const firstSectionId = normalizedForm.model[0].sectionId;
  const isFirstSectionNumbered = !isNaN(Number(firstSectionId)) && String(firstSectionId).trim() !== '';
  
  let sectionCounter = isFirstSectionNumbered ? Number(firstSectionId) : 1;

  normalizedForm.model.forEach((section) => {
    if (isFirstSectionNumbered) {
      // If the first section was a number, make all subsequent sections consecutive numbers
      section.sectionId = String(sectionCounter++);
    } else {
      // Otherwise, sanitize to a code-friendly string
      section.sectionId = toKebabCase(section.sectionId) || `section-${sectionCounter++}`;
    }
  });


  // ==========================================
  // 2. QUERY ID & ALIAS NORMALIZATION
  // ==========================================
  const aliasTracker: Record<string, number> = {};
  let undefinedCounter = 1;
  
  // Set the global query counter based on the very first query's ID (defaults to 1)
  let globalQueryId = 1;
  const firstQuery = normalizedForm.model[0]?.queries?.[0];
  if (firstQuery && typeof firstQuery.queryId === 'number' && !isNaN(firstQuery.queryId)) {
      globalQueryId = firstQuery.queryId;
  }

  // Recursive function to process flat queries AND nested conditional queries
  const processQuery = (query: XFormQuery) => {
    
    // A. Assign consecutive ordered queryId
    query.queryId = globalQueryId++;

    // B. Sanitize inputAlias to camelCase
    let baseAlias = toCamelCase(query.inputAlias);
    
    // C. Handle completely empty/invalid strings
    if (!baseAlias) {
      // Ensure we don't collide with a user who manually typed "undefinedElement1"
      let potentialAlias = `undefinedElement${undefinedCounter}`;
      while (aliasTracker[potentialAlias]) {
        undefinedCounter++;
        potentialAlias = `undefinedElement${undefinedCounter}`;
      }
      query.inputAlias = potentialAlias;
      aliasTracker[potentialAlias] = 1; // Mark this generated alias as used
      undefinedCounter++;
    } 
    // D. Enforce global uniqueness across all sections for standard aliases
    else {
      if (aliasTracker[baseAlias]) {
        // Duplicate found: Increment the count and attach it (e.g., "userProfile2")
        aliasTracker[baseAlias]++;
        query.inputAlias = `${baseAlias}${aliasTracker[baseAlias]}`;
      } else {
        // First instance: Record it as 1
        aliasTracker[baseAlias] = 1;
        query.inputAlias = baseAlias;
      }
    }

    // E. Recursively process toggledInput if the query contains conditional logic
    if (query.toggledInput) {
      processQuery(query.toggledInput);
    }
  };

  // Run the processor over all queries in all sections
  normalizedForm.model.forEach((section) => {
    if (section.queries && Array.isArray(section.queries)) {
      section.queries.forEach((query) => {
        processQuery(query);
      });
    }
  });

  return normalizedForm;
};