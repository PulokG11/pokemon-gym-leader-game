Add-Type -AssemblyName System.Web.Extensions
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$dash = [string][char]0x2013
$src = [IO.File]::ReadAllText('C:\jdwork\data.js', [Text.Encoding]::UTF8)
$ser = New-Object System.Web.Script.Serialization.JavaScriptSerializer
$ser.MaxJsonLength = 100000000
$ser.RecursionLimit = 100

$cats = @{}
$ms = [regex]::Matches($src, '(?s)C\.(\w+) = (\[.*?\n\]\]);')
foreach ($m in $ms) {
  $json = $m.Groups[2].Value
  $json = [regex]::Replace($json, ',(\s*\])', '$1')
  $cats[$m.Groups[1].Value] = $ser.DeserializeObject($json)
}
"Parsed categories: " + ($cats.Keys -join ', ')

function Esc([string]$s) { [Security.SecurityElement]::Escape($s) }

$NAVY = '1F3864'; $ACC = '2E75B6'; $GRAY = '6B7280'

function Run([string]$t, [int]$sz, [string]$color, [bool]$b, [bool]$i) {
  $rpr = '<w:rPr>'
  if ($b) { $rpr += '<w:b/>' }
  if ($i) { $rpr += '<w:i/>' }
  $rpr += '<w:color w:val="' + $color + '"/><w:sz w:val="' + $sz + '"/><w:szCs w:val="' + $sz + '"/></w:rPr>'
  '<w:r>' + $rpr + '<w:t xml:space="preserve">' + (Esc $t) + '</w:t></w:r>'
}
function Para([string]$inner, [string]$ppr) { '<w:p><w:pPr>' + $ppr + '</w:pPr>' + $inner + '</w:p>' }

function CountKw($items) {
  $n = 0
  foreach ($it in $items) { if ($it.Count -gt 2 -and $it[2]) { $n += CountKw $it[2] } else { $n++ } }
  $n
}

$sb = New-Object Text.StringBuilder
function Bullets($items, [int]$level) {
  foreach ($it in $items) {
    $label = [string]$it[0]
    $tags = $null; if ($it.Count -gt 1) { $tags = $it[1] }
    $kids = $null; if ($it.Count -gt 2) { $kids = $it[2] }
    if ($level -eq 0) {
      $r = Run $label 24 $NAVY $true $false
      $ppr = '<w:keepNext/><w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr><w:spacing w:before="140" w:after="20"/>'
    } else {
      $r = Run $label 22 '222222' $false $false
      if ($tags) { $r += Run ('  [' + $tags + ']') 18 $GRAY $false $true }
      $ppr = '<w:numPr><w:ilvl w:val="' + $level + '"/><w:numId w:val="1"/></w:numPr><w:spacing w:before="20" w:after="20"/>'
    }
    [void]$sb.Append((Para $r $ppr))
    if ($kids) { Bullets $kids ($level + 1) }
  }
}
function Plain([string]$t) {
  [void]$sb.Append((Para (Run $t 22 '222222' $false $false) '<w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr><w:spacing w:before="20" w:after="40"/>'))
}
function Heading([string]$t, [int]$lvl, [bool]$pb) {
  $ppr = '<w:pStyle w:val="Heading' + $lvl + '"/>'
  if ($pb) { $ppr += '<w:pageBreakBefore/>' }
  [void]$sb.Append((Para ('<w:r><w:t xml:space="preserve">' + (Esc $t) + '</w:t></w:r>') $ppr))
}

# Title
[void]$sb.Append((Para (Run 'Optum Senior & Lead Product Manager Roles' 44 $NAVY $true $false) '<w:pStyle w:val="Title"/>'))
[void]$sb.Append((Para (Run 'Keyword Analysis of 10 Job Descriptions' 28 $ACC $false $false) ('<w:pBdr><w:bottom w:val="single" w:sz="8" w:space="6" w:color="' + $ACC + '"/></w:pBdr><w:spacing w:after="200"/>')))

Heading 'How to read this document' 1 $false
Plain 'Keywords are grouped into seven categories. Each category has sub-groups, then keywords, then sub-terms where a JD names them.'
Plain 'Tags in brackets (e.g. [JD3, JD10]) show which job descriptions use the term. Terms tagged with several JDs are the strongest signals.'
Plain 'Terms are normalized across JDs. Where JDs use different wording for the same concept, they are merged into one keyword.'
Plain 'Company boilerplate and web-page noise (applicant statistics, related jobs, benefits blurbs) were excluded.'

Heading 'Job descriptions analyzed' 2 $false
$jds = @(
 @('JD1', "Senior Digital Product Manager $dash UnitedHealthcare App platform (Gurgaon)"),
 @('JD2', "Senior Tech Product Manager $dash RCM technology background preferred (Noida)"),
 @('JD3', "Senior Product Manager $dash Payer Agentic Platform (Hyderabad)"),
 @('JD4', "Senior Technical Product Manager $dash RCM Common Data Platform (Hyderabad)"),
 @('JD5', "Senior Product Manager $dash US Healthcare IT product (Hyderabad)"),
 @('JD6', "Senior Technical Product Manager $dash Ancillary Benefits Management data platform (Hyderabad)"),
 @('JD7', "Principal Technical Product Manager $dash AI Runtime, Agentic Platform & Compute (Chennai)"),
 @('JD8', "Senior / Lead Product Manager $dash Data Science, Machine Learning, Cloud (Hyderabad)"),
 @('JD9', "Lead Technical Product Manager $dash Payment integrity, audit & recovery (Noida)"),
 @('JD10', "Senior Product Manager $dash AI-native payment integrity products (Hyderabad)")
)
$bdr = '<w:tcBorders><w:top w:val="single" w:sz="4" w:color="BFBFBF"/><w:left w:val="single" w:sz="4" w:color="BFBFBF"/><w:bottom w:val="single" w:sz="4" w:color="BFBFBF"/><w:right w:val="single" w:sz="4" w:color="BFBFBF"/></w:tcBorders>'
function Cell([string]$t, [int]$w, [bool]$hdr) {
  $shd = ''; $col = '222222'
  if ($hdr) { $shd = '<w:shd w:val="clear" w:color="auto" w:fill="' + $NAVY + '"/>'; $col = 'FFFFFF' }
  '<w:tc><w:tcPr><w:tcW w:w="' + $w + '" w:type="dxa"/>' + $bdr + $shd + '<w:tcMar><w:top w:w="60" w:type="dxa"/><w:left w:w="100" w:type="dxa"/><w:bottom w:w="60" w:type="dxa"/><w:right w:w="100" w:type="dxa"/></w:tcMar></w:tcPr><w:p><w:pPr><w:spacing w:before="0" w:after="0"/></w:pPr>' + (Run $t 20 $col $hdr $false) + '</w:p></w:tc>'
}
[void]$sb.Append('<w:tbl><w:tblPr><w:tblW w:w="9360" w:type="dxa"/><w:tblLayout w:type="fixed"/></w:tblPr><w:tblGrid><w:gridCol w:w="1000"/><w:gridCol w:w="8360"/></w:tblGrid>')
[void]$sb.Append('<w:tr><w:trPr><w:tblHeader/></w:trPr>' + (Cell 'Ref' 1000 $true) + (Cell 'Role' 8360 $true) + '</w:tr>')
foreach ($j in $jds) { [void]$sb.Append('<w:tr>' + (Cell $j[0] 1000 $false) + (Cell $j[1] 8360 $false) + '</w:tr>') }
[void]$sb.Append('</w:tbl>')

Heading 'Strongest cross-JD signals' 2 $false
Plain 'Product craft appears in nearly every JD: roadmap, vision/strategy, user stories, acceptance criteria, backlog, prioritization, KPIs.'
Plain 'Agile delivery is named in most JDs; scaled Agile (PI planning, SAFe) in JD6.'
Plain 'Aha! and Rally are the named product tools; Jira and Azure DevOps appear alongside.'
Plain 'APIs, cloud platforms and integrations are the most common technical themes.'
Plain 'AI is explicit in JD1, JD3, JD4, JD7, JD8 and JD10. Agentic AI is central to JD3, JD7 and JD10.'
Plain 'Healthcare focus clusters into RCM (JD2, JD4), payer operations (JD3, JD5, JD6) and payment integrity (JD9, JD10).'
Plain 'Influencing without authority, executive communication and cross-functional leadership are the leadership constants.'

$order = 'health', 'ai', 'pm', 'tech', 'proj', 'lead', 'other'
$n = 1
foreach ($k in $order) {
  $c = $cats[$k]
  $title = [string]$c[0]; $desc = [string]$c[1]; $items = $c[2]
  Heading ("$n. $title") 1 $true
  $cnt = CountKw $items
  [void]$sb.Append((Para (Run ("$desc  ($cnt keywords)") 20 $GRAY $false $true) '<w:spacing w:after="120"/>'))
  Bullets $items 0
  $n++
}

$ns = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"'
$sect = '<w:sectPr><w:footerReference w:type="default" r:id="rId3"/><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1260" w:right="1440" w:bottom="1260" w:left="1440" w:header="708" w:footer="708" w:gutter="0"/></w:sectPr>'
$docXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document ' + $ns + '><w:body>' + $sb.ToString() + $sect + '</w:body></w:document>'

$stylesXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
 '<w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:eastAsia="Calibri" w:cs="Calibri"/><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="0" w:line="259" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>' +
 '<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style>' +
 '<w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:spacing w:after="80"/></w:pPr><w:rPr><w:b/><w:color w:val="' + $NAVY + '"/><w:sz w:val="44"/><w:szCs w:val="44"/></w:rPr></w:style>' +
 '<w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:pBdr><w:bottom w:val="single" w:sz="6" w:space="4" w:color="' + $ACC + '"/></w:pBdr><w:spacing w:before="240" w:after="100"/><w:outlineLvl w:val="0"/></w:pPr><w:rPr><w:b/><w:color w:val="' + $NAVY + '"/><w:sz w:val="34"/><w:szCs w:val="34"/></w:rPr></w:style>' +
 '<w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:spacing w:before="280" w:after="80"/><w:outlineLvl w:val="1"/></w:pPr><w:rPr><w:b/><w:color w:val="' + $ACC + '"/><w:sz w:val="26"/><w:szCs w:val="26"/></w:rPr></w:style>' +
 '</w:styles>'

function Lvl([int]$i, [string]$ch, [int]$left, [string]$font) {
  '<w:lvl w:ilvl="' + $i + '"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="' + $ch + '"/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="' + $left + '" w:hanging="270"/></w:pPr><w:rPr><w:rFonts w:ascii="' + $font + '" w:hAnsi="' + $font + '" w:hint="default"/></w:rPr></w:lvl>'
}
$numXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:abstractNum w:abstractNumId="0"><w:multiLevelType w:val="hybridMultilevel"/>' +
 (Lvl 0 ([string][char]0x2022) 540 'Calibri') + (Lvl 1 $dash 1080 'Calibri') + (Lvl 2 ([string][char]0x25AA) 1620 'Calibri') +
 '</w:abstractNum><w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num></w:numbering>'

$footerXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:ftr ' + $ns + '><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:color w:val="' + $GRAY + '"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">Optum PM Keyword Analysis  |  Page </w:t></w:r><w:r><w:rPr><w:color w:val="' + $GRAY + '"/><w:sz w:val="18"/></w:rPr><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:rPr><w:color w:val="' + $GRAY + '"/><w:sz w:val="18"/></w:rPr><w:instrText xml:space="preserve"> PAGE </w:instrText></w:r><w:r><w:rPr><w:color w:val="' + $GRAY + '"/><w:sz w:val="18"/></w:rPr><w:fldChar w:fldCharType="separate"/></w:r><w:r><w:rPr><w:color w:val="' + $GRAY + '"/><w:sz w:val="18"/></w:rPr><w:t>1</w:t></w:r><w:r><w:rPr><w:color w:val="' + $GRAY + '"/><w:sz w:val="18"/></w:rPr><w:fldChar w:fldCharType="end"/></w:r></w:p></w:ftr>'

$ctXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/><Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/></Types>'
$relsXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>'
$docRels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/></Relationships>'

$out = 'C:\jdwork\Optum_PM_JD_Keyword_Analysis.docx'
if (Test-Path $out) { Remove-Item $out -Force }
$zip = [IO.Compression.ZipFile]::Open($out, 'Create')
$utf8 = New-Object Text.UTF8Encoding($false)
function AddEntry($name, $text) {
  $e = $zip.CreateEntry($name)
  $s = $e.Open(); $b = $utf8.GetBytes($text); $s.Write($b, 0, $b.Length); $s.Close()
}
AddEntry '[Content_Types].xml' $ctXml
AddEntry '_rels/.rels' $relsXml
AddEntry 'word/document.xml' $docXml
AddEntry 'word/styles.xml' $stylesXml
AddEntry 'word/numbering.xml' $numXml
AddEntry 'word/footer1.xml' $footerXml
AddEntry 'word/_rels/document.xml.rels' $docRels
$zip.Dispose()
"Wrote $out"
