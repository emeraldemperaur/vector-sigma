#  💠 Vector Sigma
## Dynamic Form Orchestrator 📦
[![NPM Version](https://img.shields.io/npm/v/@emeraldemperaur/vector-sigma.svg)](https://www.npmjs.com/package/@emeraldemperaur/vector-sigma)
![Changesets](https://img.shields.io/badge/maintained%20with-changesets-176de3?style=flat-square&logo=changesets&logoColor=white) 
[![Release Status](https://github.com/emeraldemperaur/vector-sigma/actions/workflows/release.yml/badge.svg)](https://github.com/emeraldemperaur/vector-sigma/actions)
![Tests](https://raw.githubusercontent.com/emeraldemperaur/vector-sigma/prometheus/badges/test.svg)


### Overview
<p align="justify">
Vector Sigma is a dynamic form orchestrator package for rapidly creating and managing the complex lifecycle of interactive extensible input forms that can be easily embedded into a React front-end client interface for use in data capturing & onboarding applications or systems. 

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
```javascript
var s = "JavaScript/TypeScript Code Snippet";
alert(s);
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
</li>

<li><strong>🏗️Builder Object Pattern</strong></br>
<p align="justify">Method chaining offers a modern, fluent alternative to static JSON object configuration that elevates the developer experience (DX) by enabling rapid form creation using intuitive method chains that are human-readable and generate type-safe xForm schema definitions automatically.</p>

```javascript
var s = "JavaScript/TypeScript Code Builder Snippet";
alert(s);
```
</li>

<li><strong>🛡️Input Validation</strong></br>
<p align="justify">Declarative schema (JSON) facilitates a validation engine that is comprehensive, accessible and easy to maintain. <code>onChange()</code>, <code>onBlur()</code> input event control state updates, errors and <code>values</code> are handled automatically. <code>onSubmit()</code> handler is automatically blocked if the input is invalid.</p>
</li>

<li><strong>🧠Form State Management</strong></br>
<p align="justify">Leveraged Formik for robust React state management and Yup for declarative schema validation to adhere strictly to the standard React form lifecycle, ensuring compatibility with Redux DevTools & standard debugging workflows.</p>
</li>

<li><strong>🎨Theming Extensibilty</strong></br>
<p align="justify">Customizable to fit seamlessly into an existing design system and allow developer control of the visual layer through standard CSS patterns.</p>

```javascript
var s = "JavaScript/TypeScript Style Snippet";
alert(s);
```
</li>

<li><strong>🧩Exported UI Components</strong></br>
<p align="justify">Explicitly exported reusable form UI components with material, outline and neumorphic design variants from package entry point <code>src/index.ts</code> to enable developer-friendly use as lightweight component library.</p>
<p><em>Container, Row, Column, xAvatar, xButton, CheckboxGroup, ConditionalTrigger, DatePicker, DateRangePicker, DateTimePicker, Dropdown, File, FileMultiple, FlagIcon, Icon, Image, Input, PasswordInput, PhoneInput, UUIDInput, xCreditCardInput, CurrencyInput, StockInput, xRadioGroup, OptionSelect, MultipleSelect, RangeSlider, Toggle, xTitle</em></p>

```javascript
var s = "JavaScript/TypeScript Component Snippet";
alert(s);
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