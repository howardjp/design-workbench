import MarkdownIt from 'markdown-it';

// The catalog is authored Markdown. Raw HTML is intentionally escaped in this
// adapter; the separate HTML/MathML stress fixture is not yet supported.
export function renderMarkdown(source, base = '/') {
  const markdown = new MarkdownIt({html: false});
  const original = markdown.renderer.rules.link_open ?? ((tokens, index, options, _env, renderer) => renderer.renderToken(tokens, index, options));
  markdown.renderer.rules.link_open = (tokens, index, options, env, renderer) => {
    const href = tokens[index].attrGet('href');
    if (href?.startsWith('/') && !href.startsWith('//')) tokens[index].attrSet('href', base.replace(/\/$/, '') + href);
    return original(tokens, index, options, env, renderer);
  };
  const image = markdown.renderer.rules.image;
  markdown.renderer.rules.image = (tokens, index, options, env, renderer) => {
    const src = tokens[index].attrGet('src');
    if (src?.startsWith('/') && !src.startsWith('//')) tokens[index].attrSet('src', base.replace(/\/$/, '') + src);
    return image(tokens, index, options, env, renderer);
  };
  return markdown.render(source);
}
