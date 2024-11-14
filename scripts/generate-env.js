const fs = require('fs');

const environmentFile = `window._env_ = {
  REACT_APP_GEMINI_API_KEY: '${process.env.REACT_APP_GEMINI_API_KEY}'
};
`;

// During build, write to build directory, otherwise write to public
const outputDir = process.env.NODE_ENV === 'production' ? './build' : './public';
fs.writeFileSync(`${outputDir}/env-config.js`, environmentFile);
console.log(`Generated env-config.js in ${outputDir}`); 