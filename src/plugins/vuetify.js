// src/plugins/vuetify.js
import { createVuetify } from 'vuetify';
import 'vuetify/styles';  // Ensure Vuetify styles are loaded

// Assuming you are using Vite, Webpack or similar tool that supports ES module imports
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

const vuetify = createVuetify({
  components,
  directives
});

export default vuetify;
