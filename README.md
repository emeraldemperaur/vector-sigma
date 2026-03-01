#  💠 Vector Sigma
## Dynamic Form Orchestrator 📦
[![NPM Version](https://img.shields.io/npm/v/@emeraldemperaur/vector-sigma.svg)](https://www.npmjs.com/package/@emeraldemperaur/vector-sigma)
![Changesets](https://img.shields.io/badge/maintained%20with-changesets-176de3?style=flat-square&logo=changesets&logoColor=white) 
[![Release Status](https://github.com/emeraldemperaur/vector-sigma/actions/workflows/release.yml/badge.svg)](https://github.com/emeraldemperaur/vector-sigma/actions)


### Overview
<p align="justify">
Vector Sigma (VΣ) is a dynamic form orchestrator package for rapidly creating and managing the complex lifecycle of interactive extensible input forms that can be easily embedded into a React front-end client interface for use in data capturing & onboarding applications or systems. 

 Fields, Input Validation and Submission can be defined and parametized in real-time predicated on a JSON (JavaScript Object Notation) xForm definition or builder object pattern.
</p>
 
#### Key Features
<ol>
<li>
<strong>Real-Time Form Adaptation:</strong> Adapt the form layout by adding/removing fields, sections or entire steps based on conditional logic.</li>
<li>
<strong>Validation Logic Management:</strong> Centralize business rules such as complex field validation, visibility constraints, and facilitate input value pre-population from external APIs.
</li>
<li>
<strong>Form State Coordination:</strong> Monitor the "state" of the form across multi-step processes, allowing users to save progress and resume later.
</li>
<li>
<strong>Application UI Integration:</strong> Connects the form data to backend workflows, CRM systems, or databases immediately upon submission.</li>
</ol>

### Documentation

### Installation
```bash
npm install @emeraldemperaur/vector-sigma
```

### Peer Dependencies
```bash
npm install react@latest react-dom@latest sass@latest
```
### Usage

#### Stateless Implementation
```javascript
import React from 'react';
import { VectorSigma } from './VectorSigma';

const xForm = new VectorSigma(apiJSONSchema);
// e.g. https://github.com/emeraldemperaur/vector-sigma/blob/prometheus/src/utils/artificer.json

return xForm.transform({
    displayMode: 'dual',
    readOnlyMode: false,
    onSubmit: async (values, actions, instance) => {
        // Send validated xForm 'values' payload to destination API endpoint
        await axios.post('/api/submit', values);
        // Reset form after HTTP POST request success and more (i.e. https://formik.org/docs/api/formik)
        actions.resetForm(); 
    }
});
```
#### Stateful Implementation
<p align="justify">
<code>useVectorSigma</code> hook method utilizes React lazy initialization in tandem with <code>useRef</code> to guarantee VectorSigma class is created exactly once when the VΣ component mounts, and safely persists across DOM re-renders.
</p>

```javascript
import React from 'react';
import { useVectorSigma } from './hooks/useVectorSigma';
import { apiXFormData } from './mockData';
// e.g. https://github.com/emeraldemperaur/vector-sigma/blob/prometheus/src/utils/artificer.json

// Optionally define interface for inputAlias's expected in xForm 'values'
interface VΣRegistrationForm {
    firstName: string;
    lastName: string;
    emailAddress: string;
    isMITUndergraduate: boolean;
}

export const VΣRegistrationForm = () => {
    
    // Optionally pass the interface into the hook to apply <T> typing to 'values'
    const xFormBuilder = useVectorSigma<VΣRegistrationForm>(apiXFormData);

    // Or w/out a specified interface
    const xFormBuilder = useVectorSigma(apiXFormData);
        .setName('VΣ Registration Form')
        .setBrand("brandHexColor", "www.exampleurl.com/logoimage.png", 'right')
    return xFormBuilder.render({
        displayMode: 'accordion',
        readOnlyMode: false,
        // Access 'values', 'actions' and 'instance' objects in global onSubmit callback function
        onSubmit: async (values, actions, instance) => {
            
            console.log("Email:", values.emailAddress);
            console.log("MIT Undergraduate:", values.isMITUndergraduate);
            const timeTakenMs = (instance.timeSubmitted || Date.now()) - instance.timeCreated;
            console.log(`VΣ User finished the xForm in ${timeTakenMs / 1000} seconds.`);
            console.log(`xForm Status:`, instance.statusCode);
            
           try {
                // Initiate HTTP POST request with stateful 'values' and 'instance' payload
                await fetch(`/api/questionnaires/${instance.formObject.uuid}/responses`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                formVersion: instance.formObject.uuid,
                                responseTime: instance.timeSubmitted - instance.timeCreated,
                                xFormObject: instance.formObject,
                                answers: values
                            })
                        });
                // Reset form after HTTP POST request success and more (i.e. https://formik.org/docs/api/formik)
                actions.resetForm(); 
                alert("Thank you for completing the VΣ questionnaire!");
               } catch (error) {
                      console.error("Failed to save responses to VΣ DB", error);
                }
        }
    });
  
};
```

### Screenshots

#### Automation Workflow Use Case

#### Web Application Use Case

### Design Tenets
<ul>
<li><strong>📦CJS/ESM Compatible</strong></br>
<p align="justify">Dual mode package with both CommonJS (CJS) & ES Modules (ESM) builds bundled using <code>Rollup.js</code> to facilitate universal module compatibility and enable effortless integration across legacy and modern JavaScript ecosystems.</p>
</li>

<li><strong>🔒JSON Schema Validation</strong></br>
<p align="justify">Adopted <code>Zod</code> as the native engine for JSON schema validation to provide a TypeScript-first validation layer. Schema validation guarantees any schema object provided strictly adheres with the expected API model before rendering to client viewport.</p>

```javascript
import React from 'react';
import { VectorSigma } from './VectorSigma';
import { xFormPrototypeData } from './mockData'; 

export const BespokeAPIForm = ({ brandColor, brandLogoUrl }) => {
    
    // Initialize VectorSigma xForm with JSON schema
    const xFormBuilder = new VectorSigma(xFormPrototypeData);

    // Chain VectorSigma builder methods to specify or override the xForm model properties dynamically
    const xFormElement = xFormBuilder
        .setName('Cyberdyne Systems Billing Form')
        // Optionally override brand color and logo from JSON {} with brand props
        // setBrand(color, logoUrl?, logoPosition?)
        .setBrand(tenantBrandColor, tenantLogo, 'left')
        
        // Output xForm React component with .transform()
        .transform({
            displayMode: 'dual', // Dual Display UI (i.e. Codice | Accordion)
            readOnlyMode: false,
            // Optionally inject VectorSigma global callback function
            onSubmit: async (values, actions, instance) => {
                console.log("Processing Payment...", values);
                
                // Initiate a HTTP POST request to destination API with 'values' payload
                await new Promise(resolve => setTimeout(resolve, 1997));
                
                alert("Payment processed successfully!...");
                // Update Formik context to isSubmitting false after successful HTTP post request
                actions.setSubmitting(false); 
            },
            // Optionally inject Teletraan1 (codex display) callback function
            onFinish: () => {
                console.log("xForm submission complete.");
            }
        });

    return (
        <div className="cyberdyne-store-portal">
            {xFormElement}
        </div>
    );
};
```
</li>

<li><strong>🏗️Builder Object Pattern</strong></br>
<p align="justify">Method chaining offers a modern, fluent alternative to static JSON object configuration that elevates the developer experience (DX) by enabling rapid form creation using intuitive method chains that are human-readable and generate type-safe xForm schema definitions automatically.</p>

```javascript
import React from 'react';
import { VectorSigma } from './VectorSigma';

export const VΣCodexForm = () => {
    // Initialize an empty xForm
    const xFormBuilder = new VectorSigma();

    // Chain object methods to build xForm schema
    // ---------------------------------------------------------
    // METHOD A: addSection(xFormSectionSchema{})
    // METHOD B: createSection() * addQueryToSection()
    // ---------------------------------------------------------
    const xFormElement = xFormBuilder
        .setUUID('ai-agent-007')
        .setName('New User Onboarding')
        // setBrand(color, logoUrl?, logoPosition?)
        .setBrand(
            '#800020', // Brand (i.e. Primary) color
            'https://www.example.com/brandLogo.jpeg', // Brand Logo URL
            'center' // Brand Logo alignment
        )
        .createSection('personal-info', 'Personal Information', 'user')
        .addQueryToSection('personal-info', {
            queryId: 101,
            inputType: 'text-input',
            inputAlias: 'firstName',
            inputLabel: 'First Name',
            inputPlaceholder: 'Enter your first name',
            inputWidth: 6,
            newRow: true,
            isRequired: true,
            errorText: 'First name is required'
        })
        .createSection('address-info', 'Address Info', 'home')
        .addQueryToSection('address-info', {
            queryId: 102,
            inputType: 'password-input',
            inputAlias: 'securityCode',
            inputLabel: 'Secure Passcode',
            inputWidth: 6,
            newRow: true,
            isRequired: true,
            errorText: 'Security code is required'
        })
        .addSection({
            sectionId: "shipping-info",
            title: "Shipping Address",
            icon: "paperplane",
            queries: [
                {
                    queryId: 103,
                    inputType: "text-input",
                    inputAlias: "deliveryAddress",
                    inputLabel: "Home Address",
                    inputWidth: 9,
                    newRow: false,
                    isRequired: true,
                    errorText: 'Address is required for shipping'
                }
            ]
        })
        .render({
            displayMode: 'codex',
            readOnlyMode: false,
            // Optionally inject Teletraan1 (codex display) callback
            onFinish:  () => {
                console.log("xForm submission complete.");
            }
            // Optionally inject VectorSigma global callback
            onSubmit: async (values, actions, instance) => {
                console.log("Submitting to API...", values);
                try {
                    await fetch('/api/users/onboard', {
                        method: 'POST',
                        body: JSON.stringify(values)
                    });
                    alert("VΣ has come to...");
                    actions.submitForm();
                    actions.resetForm();
                } catch (error) {
                    console.error("xForm submission failed", error);
                }
            }
        });

    return (
        <div className="x-form-container">
            {xFormElement}
        </div>
    );
};
```
</li>

<li><strong>🛡️Input Validation</strong></br>
<p align="justify">Declarative schema (JSON) <code>isRequired</code> and <code>errorText</code> attributes facilitate a validation engine that is comprehensive, accessible and easy to maintain. <code>onChange()</code>, <code>onBlur()</code> input event control state updates, errors and <code>values</code> are handled automatically. <code>onSubmit()</code> handler is automatically blocked if the input vs. validation schema is invalid.</p>

```javascript
 const xFormElement = xFormBuilder
        .setUUID('kaiju-zaibatsu-101011')
        .setName('Monaco Smart Road User Registration')
        .setBrand(
            '#800020',
            'https://www.example.com/brandLogo.jpeg',
            'right'
        )
        .createSection('vehicle-info', 'Vehicle Information', 'avatar')
        .addQueryToSection('vehicle-info', {
            queryId: 1,
            inputType: 'text-input',
            inputAlias: 'vehicleRegistration',
            inputLabel: 'Vehicle Registration Number',
            inputPlaceholder: 'Enter your vehicle registration number',
            inputWidth: 7,
            newRow: true,
            isRequired: true, // Specifies if input validation required
            errorText: 'A vehicle registration number is required' // Specifies errorText rendered when isRequired and validation fails
        })
```
</li>

<li><strong>🧠Form State Management</strong></br>
<p align="justify">Leveraged Formik for robust React state management and Yup for declarative schema validation to adhere strictly to the standard React form lifecycle, ensuring compatibility with Redux DevTools & standard debugging workflows.</p>

```javascript
import React from 'react';
import { useVectorSigma } from './hooks/useVectorSigma';

 const xFormBuilder = useVectorSigma(apiXFormData);
        .setName('VΣ Robot Activation')
        .setBrand("brandHexColor", "www.exampleurl.com/logoimage.png", 'center')
    return xFormBuilder.render({
        displayMode: 'codex',
        readOnlyMode: false,
        // Access 'values', 'actions' and 'instance' object(s) in global onSubmit callback function
        // 'instance' :: { errors, statusCode, isSubmitting, timeCreated, timeInProgress, timeSubmitted, formObject } 
        onSubmit: async (values, actions, instance) => {
            
            console.log("VΣ User Email:", values.emailAddress);
            console.log("VΣ Robot Serial Number:", values.serialNumber);
            const timeTakenMs = (instance.timeSubmitted || Date.now()) - instance.timeCreated;
            console.log(`VΣ User finished the xForm in ${timeTakenMs / 1000} seconds.`);
            console.log(`Extant xForm Status:`, instance.statusCode);
            console.log(`Extant xForm object:`, instance.formObject);
            // Initiate Promise or API HTTP POST
            await new Promise(resolve => setTimeout(resolve, 1000));
            alert("VΣ Robot Activated!");
            actions.resetForm();
        }
        })
```
</li>

<li><strong>🎨Theming Extensibilty</strong></br>
<p align="justify">Customizable to fit seamlessly into an existing design system and allow developer control of the visual layer through standard CSS patterns.</p>

```javascript
import { Theme, File, Dropdown } from '@emeraldemperaur/vector-sigma';

const App = () => {
  return (
    
    <Theme>
      <File/>
      <Dropdown/>
    </Theme>
  );
}
```
</li>

<li><strong>🧩Exported UI Components</strong></br>
<p align="justify">Explicitly exported reusable form UI components with material, outline and neumorphic design variants from package entry point <code>src/index.ts</code> to enable developer-friendly use as lightweight ARIA compliant component library.</p>
<p><em>Container, Row, Column, Theme, Accordion, AccordionItem, Codex, CodexItem, CodexControls, AvatarInput, ButtonInput, CheckboxGroupInput, ConditionalTrigger, DatePicker, DateRangePicker, DateTimePicker, Dropdown, File, FileMultiple, FlagIcon, Icon, Image, Input, PasswordInput, PhoneInput, CreditCardInput, CurrencyInput, StockInput, RadioGroupInput, OptionSelect, MultipleSelect, RangeSlider, SliderInput, Toggle, SectionTitle, Teletraan1 (Render Matrix)</em></p>

```javascript
import { Container, Column, Row, CheckboxGroup, Dropdown, File, RangeSlider } 
from '@emeraldemperaur/vector-sigma';
import { Theme } from '@emeraldemperaur/vector-sigma';
import { Form, Formik } from 'formik'
import * as Yup from 'yup'


const App = () => {
  return (
    <Container fluid>
      <Row>
        <Column span={9}>
        <Formik 
          initialValues={{
            dropdownInput: 'Zaibatsu',
          }}
          
          validationSchema={Yup.object({
            dropdownInput: Yup.string().required('Dropdown selection is required'),
          })}

          onSubmit={(values) => {
            console.log(values);
          }}
    >
      {({ values }) => (
        <Form>
            <Theme>
            <File alias='inputFile' width={3}/>
            <Dropdown alias="dropdownInput" width={8} inputLabel="Dropdown Element" inputtype="dropdown-outline" value="Zaibatsu" 
                inputoptions={
                    [
                    {optionid: 1, 
                    optionvalue: "Kaiju", 
                    optionurl:"https://github.com/emeraldemperaur", 
                    text: "Kaiju"},
                    {optionid: 2, 
                    optionvalue: "Meka", 
                    optionurl:"https://www.mekaegwim.ca", 
                    text: "Meka"},
                    {optionid: 3, 
                    optionvalue: "Godzilla", 
                    optionurl:"https://www.me.ca", 
                    text: "Godzilla"},
                    {optionid: 4, 
                    optionvalue: "Zaibatsu", 
                    optionurl:"https://www.npmjs.com/package/@emeraldemperaur/vector-sigma", 
                    text: "Zaibatsu"},
                    ]}/>
            </Theme>
            <button type="submit" style={{ marginTop: 20 }}>Submit</button>
        </Form>
      )}
        </Formik>
        </Column>
      </Row>
    </Container>
  );
}

```
</li>

<li><strong>📱Mobile Responsive</strong></br>
<p align="justify">'Mobile-First' layout design ensures that complex form orchestrations remain usable, accessible, and performant on any viewport.</p>
</li>
</ul>

### Tool Stack
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23F7DF1E.svg?style=for-the-badge&logo=javascript&logoColor=black)
![RollupJS](https://img.shields.io/badge/RollupJS-EC4A3F?style=for-the-badge&logo=rollupdotjs&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232A.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![SASS](https://img.shields.io/badge/SASS-hotpink.svg?style=for-the-badge&logo=SASS&logoColor=white)
![Zod](https://img.shields.io/badge/zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white)
![Radix UI](https://img.shields.io/badge/radix%20ui-161616.svg?style=for-the-badge&logo=radix-ui&logoColor=white)
![Formik](https://img.shields.io/badge/formik-161616?style=for-the-badge&logo=formik&logoColor=white)
![Yup](https://img.shields.io/badge/yup-161616?style=for-the-badge&logo=yup&logoColor=white)
![Testing Library](https://img.shields.io/badge/-Testing%20Library-%23E33332?style=for-the-badge&logo=testing-library&logoColor=white)
![Jest](https://img.shields.io/badge/-jest-%23C21325?style=for-the-badge&logo=jest&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/github%20actions-%232671E5.svg?style=for-the-badge&logo=githubactions&logoColor=white)


### Changeset Versioning Synopsis
<ol>
<li>
<p align="justify"><strong>Install Changeset CLI on 'main | prometheus' branch</strong></p>

```bash
npm install --save-dev @changesets/cli
# Changeset project initializer
npx changeset init
```
</li>
<li>
<p align="justify"><strong>Create new working 'changeset' branch</strong></p>

```bash
git checkout -b new-changeset-branchname
```
</li>

<li><p align="justify"><strong>Update/Modify source code</strong></p></li>

<li>
<p align="justify"><strong>Run Changeset CLI to create changeset file</strong></p>

```bash
# Changeset - patch, minor, major versioning
npx changeset

# PreRelease mode (alpha)
npx changeset pre enter alpha

# PreRelease mode (beta)
npx changeset pre enter beta

# Exit PreRelease mode 
npx changeset pre exit
```
</li>

<li>
<p align="justify"><strong>Commit source code changes to git</strong></p>

```bash
git add .
git commit -m "Changeset :: commit message"
git status
# confirm clean working tree before push
git push origin new-changeset-branchname

```
</li>

<li>
<p align="justify"><strong>Merge Changeset 'workflow' and 'version packages' PRs on Github repository</strong></p>
</li>

<li>
<p align="justify"><strong>Checkout 'main | prometheus' origin branch</strong></p>

```bash
git checkout prometheus

```
</li>

<li>
<p align="justify"><strong>Pull remote version changes merged from working 'changeset' branch to 'main | prometheus' origin branch</strong></p>

```bash
git pull origin prometheus

```
</li>

</ol>