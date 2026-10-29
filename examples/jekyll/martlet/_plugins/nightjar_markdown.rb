# frozen_string_literal: true
require 'cgi'
require 'sanitize'

# Input is escaped before this filter: when plugins are disabled (e.g. --safe),
# the fallback displays escaped markup instead of exposing executable HTML.
module NightjarMarkdown
  CONFIG = {
    elements: %w[p br em strong del s blockquote ul ol li a code pre div span h1 h2 h3 h4 h5 h6 hr table thead tbody tr th td sup sub var img math mrow mi mn mo msup],
    attributes: {
      all: %w[id class title],
      'a' => %w[href title], 'img' => %w[src alt title width height],
      'ol' => %w[start], 'li' => %w[value],
      'th' => %w[scope colspan rowspan], 'td' => %w[colspan rowspan],
      'math' => %w[xmlns display]
    },
    protocols: { 'a' => { 'href' => ['http', 'https', 'mailto', :relative] }, 'img' => { 'src' => ['http', 'https', :relative] } },
    remove_contents: %w[script style iframe object embed]
  }.freeze

  def nightjar_sanitize(escaped_html)
    Sanitize.fragment(CGI.unescapeHTML(escaped_html.to_s), CONFIG)
  end
end
Liquid::Template.register_filter(NightjarMarkdown)
