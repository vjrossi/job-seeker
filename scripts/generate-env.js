const fs = require('fs');

const environmentFile = `
window._env_ = {
  REACT_APP_GEMINI_API_KEY: '${process.env.REACT_APP_GEMINI_API_KEY}'
};
`;

fs.writeFileSync('./build/env-config.js', environmentFile); 