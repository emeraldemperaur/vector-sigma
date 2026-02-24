import { normalizeXForm } from '../../utils/minerva';
import { XFormType } from '../../utils/voltron';

describe('VΣ Utility(Minerva) Test', () => {
  it('Minerva :: Converts string section IDs to kebab-case', () => {
    const mockForm = {
      name: 'xForm Prototype',
      uuid: 'omega-supreme-test-1',
      model: [
        { sectionId: 'Profile Information!', title: 'Profile', queries: [] },
        { sectionId: 'Billing_Data', title: 'Billing', queries: [] },
      ],
    } as XFormType;

    const result = normalizeXForm(mockForm);

    expect(result.model[0].sectionId).toBe('profile-information');
    expect(result.model[1].sectionId).toBe('billing-data');
  });

  it('Minerva :: Sanitized consecutive numbering when the first section ID encountered is a number', () => {
    const mockForm = {
      name: 'xForm Prototype',
      uuid: 'omega-supreme-test-2',
      model: [
        { sectionId: '1', title: 'Step 1', queries: [] },
        { sectionId: 'random-string', title: 'Step 2', queries: [] },
        { sectionId: 'another-string', title: 'Step 3', queries: [] },
      ],
    } as XFormType;

    const result = normalizeXForm(mockForm);

    expect(result.model[0].sectionId).toBe('1');
    expect(result.model[1].sectionId).toBe('2');
    expect(result.model[2].sectionId).toBe('3');
  });

  it('Minerva :: Normalized consecutive query IDs starting from the first query ID', () => {
    const mockForm = {
      uuid: 'test-3',
      model: [
        {
          sectionId: 'sec-1',
          title: 'Sec 1',
          queries: [
            { queryId: 100, inputType: 'text', inputAlias: 'q1' }, // Starts at 100
            { queryId: 0, inputType: 'text', inputAlias: 'q2' },
          ],
        },
        {
          sectionId: 'sec-2',
          title: 'Sec 2',
          queries: [
            { queryId: 999, inputType: 'text', inputAlias: 'q3' },
          ],
        },
      ],
    } as unknown as XFormType;

    const result = normalizeXForm(mockForm);

    expect(result.model[0].queries[0].queryId).toBe(100);
    expect(result.model[0].queries[1].queryId).toBe(101);
    expect(result.model[1].queries[0].queryId).toBe(102);
  });

  it('Minerva :: Normalized inputAlias to camelCase and resolved duplicates with a counter suffix', () => {
    const mockForm = {
      uuid: 'test-4',
      model: [
        {
          sectionId: 'sec-1',
          title: 'Sec 1',
          queries: [
            { queryId: 1, inputType: 'text', inputAlias: 'User Name' },      // -> userName
            { queryId: 2, inputType: 'text', inputAlias: 'user_name' },      // -> userName2
            { queryId: 3, inputType: 'text', inputAlias: 'USER NAME' },      // -> userName3
          ],
        },
      ],
    } as unknown as XFormType;

    const result = normalizeXForm(mockForm);

    expect(result.model[0].queries[0].inputAlias).toBe('userName');
    expect(result.model[0].queries[1].inputAlias).toBe('userName2');
    expect(result.model[0].queries[2].inputAlias).toBe('userName3');
  });

  it('Minerva :: Sanitized empty aliases by replacing with placeholder: undefinedElement[N]', () => {
    const mockForm = {
      uuid: 'test-5',
      model: [
        {
          sectionId: 'sec-1',
          title: 'Sec 1',
          queries: [
            { queryId: 1, inputType: 'text', inputAlias: '' },               // -> undefinedElement1
            { queryId: 2, inputType: 'text', inputAlias: '   ' },            // -> undefinedElement2
            { queryId: 3, inputType: 'text', inputAlias: '@#$%' },           // -> undefinedElement3 (strips to empty)
            { queryId: 4, inputType: 'text', inputAlias: 'undefinedElement2' } // -> undefinedElement22 (standard duplicate handling applies to manual collisions)
          ],
        },
      ],
    } as unknown as XFormType;

    const result = normalizeXForm(mockForm);

    expect(result.model[0].queries[0].inputAlias).toBe('undefinedElement1');
    expect(result.model[0].queries[1].inputAlias).toBe('undefinedElement2');
    expect(result.model[0].queries[2].inputAlias).toBe('undefinedElement3');
    // Because undefinedElement2 was manually provided, the standard duplicate tracker appends a '2' to the base string
    expect(result.model[0].queries[3].inputAlias).toBe('undefinedElement22'); 
  });

  it('Minerva :: Recursively sanitized toggledInput (conditional queries)', () => {
    const mockForm = {
      uuid: 'test-6',
      model: [
        {
          sectionId: 'sec-1',
          title: 'Sec 1',
          queries: [
            {
              queryId: 1,
              inputType: 'conditional-toggle',
              inputAlias: 'Parent Query', // -> parentQuery
              toggledInput: {
                queryId: 0,
                inputType: 'text',
                inputAlias: 'Child Query', // -> childQuery
                toggledInput: {
                  queryId: 0,
                  inputType: 'text',
                  inputAlias: 'Parent Query', // Duplicate of top level -> parentQuery2
                },
              },
            },
          ],
        },
      ],
    } as unknown as XFormType;

    const result = normalizeXForm(mockForm);

    const topQuery = result.model[0].queries[0];
    const childQuery = topQuery.toggledInput!;
    const grandChildQuery = childQuery.toggledInput!;

    // Alias checks
    expect(topQuery.inputAlias).toBe('parentQuery');
    expect(childQuery.inputAlias).toBe('childQuery');
    expect(grandChildQuery.inputAlias).toBe('parentQuery2');

    // Query ID checks (should be 1, 2, 3 consecutively)
    expect(topQuery.queryId).toBe(1);
    expect(childQuery.queryId).toBe(2);
    expect(grandChildQuery.queryId).toBe(3);
  });
  
  it('Minerva :: Returned the normalized xForm object safely if {}.model attribute array[] is empty or missing', () => {
    const mockForm = { uuid: 'test-7', name: 'Empty', model: [] } as XFormType;
    const result = normalizeXForm(mockForm);
    expect(result).toEqual(mockForm);
  });
});