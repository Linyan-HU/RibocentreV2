require "kramdown"

module RibocentrePresentation
  class RibozymeStatistics < Jekyll::Generator
    def generate(site)
      groups = table(site, "ribozyme", "table_id").children.select { |n| n.value == "tbody" }
      families = {}
      groups.each do |group|
        rows(group).each do |cells|
          path = family_path(cells.fetch(0))
          raise "Duplicate family entry: #{path}" if families.key?(path)
          families[path] = {
            "name" => label(cells[0]), "path" => path,
            "size" => group.attr.fetch("data-size").capitalize,
            "year" => label(cells.fetch(2)),
            "rfam" => anchors(cells.fetch(4)).map { |a| label(a) }.grep(/\ARF\d{5}\z/).uniq,
            "pdb" => [], "publications" => 0
          }
        end
      end

      rows(table(site, "structure", "mytable")).each do |cells|
        family = families.fetch(family_path(cells.fetch(0)))
        # Two catalogue labels retain a superseded accession in parentheses.
        id = label(cells.fetch(5))[/\A[0-9][A-Z0-9]{3}(?=\z|\s|\()/i]
        raise "Unexpected PDB label: #{label(cells[5])}" unless id
        family["pdb"] << id.upcase
      end

      rows(table(site, "publications", "mytable")).each do |cells|
        families.fetch(family_path(cells.fetch(3)))["publications"] += 1
      end

      records = families.values
      records.each { |r| r["pdb"] = r["pdb"].uniq }
      site.data["ribozyme_statistics"] = {
        "records" => records,
        "rfam" => records.flat_map { |r| r["rfam"] }.uniq.size,
        "pdb" => records.flat_map { |r| r["pdb"] }.uniq.size,
        "publications" => records.sum { |r| r["publications"] }
      }
    end

    private

    def table(site, page, id)
      content = File.read(site.in_source_dir("_pages", "#{page}.md")).gsub(/<!--.*?-->/m, "")
      fragment = content[/<table\b[^>]*\bid="#{id}"[^>]*>.*?<\/table>/mi]
      raise "Missing statistics source table #{page}/#{id}" unless fragment
      Kramdown::Document.new(fragment, input: "html", html_to_native: false).root.children.first
    end

    def rows(parent)
      parent.children.flat_map do |node|
        if node.value == "tbody"
          rows(node)
        elsif node.value == "tr"
          cells = node.children.select { |c| c.value == "td" }
          cells.empty? ? [] : [cells]
        else
          []
        end
      end
    end

    def label(node)
      return node.value if node.type == :text
      node.children.map { |child| label(child) }.join.strip
    end

    def anchors(node)
      return [node] if node.value == "a"
      node.children.flat_map { |child| anchors(child) }
    end

    def family_path(cell)
      anchors(cell).fetch(0).attr.fetch("href").sub(%r{\Ahttps?://(?:www\.)?ribocentre\.org}i, "").strip
    end
  end
end
