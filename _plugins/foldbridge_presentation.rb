# Published detail HTML contains a frozen copy of the old header/footer.
# Reuse each original article verbatim inside the shared layout at build time.
# Source records, figures, molecular data and citations are never rewritten.
module RibocentrePresentation
  class LegacyDetails < Jekyll::Generator
    safe true
    priority :low
    def generate(site)
      site.static_files.dup.each do |file|
        next unless file.relative_path.match?(%r{\A/?docs/[^/]+\.html\z})
        source = File.read(file.path)
        article = source[/<article\b.*?<\/article>/m]
        next unless article
        title = source[/<title>(.*?)<\/title>/m, 1]
        article = article.gsub('{{ site.url }}', '').gsub('{{ site.baseurl }}', site.baseurl.to_s)
        page = Jekyll::PageWithoutAFile.new(site, site.source, 'docs', File.basename(file.path))
        page.content = "{% raw %}#{article}{% endraw %}"
        page.data = {'layout' => 'default', 'title' => title, 'sitemap' => false}
        site.pages << page
        site.static_files.delete(file)
      end
    end
  end

  # Prefer identical local assets/routes when they exist so preview clicks remain local.
  def self.localize(item)
    site = item.site
    return unless item.output_ext == '.html'
    routes = site.pages.map(&:url) + site.posts.docs.map(&:url)
    item.output = item.output.gsub(%r{https?://(?:www\.)?ribocentre\.org(/[^\s"'<>]*)}) do |url|
      path = Regexp.last_match(1)
      clean = path.split(/[?#]/).first
      local = File.file?(File.join(site.source, clean.sub(%r{\A/}, ''))) || routes.include?(clean) || routes.include?(clean + '/')
      local ? site.baseurl.to_s + path : url
    end
  end
end
Jekyll::Hooks.register [:pages, :documents], :post_render do |item|
  RibocentrePresentation.localize(item)
end
