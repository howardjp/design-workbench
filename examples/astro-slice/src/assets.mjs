import station from '../../page-archetypes/jekyll/assets/examples/station.svg?url';
import coast from '../../page-archetypes/jekyll/assets/examples/coast.svg?url';
import notebook from '../../page-archetypes/jekyll/assets/examples/notebook.svg?url';
const assets = {'/assets/examples/station.svg':station, '/assets/examples/coast.svg':coast, '/assets/examples/notebook.svg':notebook};
export function exampleImage(path) {
  if (!Object.hasOwn(assets, path)) throw new Error(`Unsupported example image: ${path}`);
  return assets[path];
}
