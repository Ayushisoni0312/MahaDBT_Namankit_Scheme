import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';

class WebComponent extends HTMLElement {
  connectedCallback() {
    const root = ReactDOM.createRoot(this);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    this._root = root;
  }
  disconnectedCallback() {
    this._root?.unmount();
  }
}

const ELEMENT_NAME = 'namankit-scheme';
if (customElements.get(ELEMENT_NAME)) {
  console.log(`Skipping registration for <${ELEMENT_NAME}> (already registered)`);
} else {
  customElements.define(ELEMENT_NAME, WebComponent);
}