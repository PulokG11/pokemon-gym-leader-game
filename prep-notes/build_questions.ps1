param([string]$SrcDir, [string]$Out)
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$NAVY = '1F3864'; $ACC = '2E75B6'; $GRAY = '6B7280'; $TEAL = '0F6E56'
$dash = [string][char]0x2013

function Esc([string]$s) { [Security.SecurityElement]::Escape($s) }

function RunX([string]$t, [int]$sz, [string]$color, [bool]$b, [bool]$i) {
  $rpr = '<w:rPr>'
  if ($b) { $rpr += '<w:b/>' }
  if ($i) { $rpr += '<w:i/>' }
  $rpr += '<w:color w:val="' + $color + '"/><w:sz w:val="' + $sz + '"/><w:szCs w:val="' + $sz + '"/></w:rPr>'
  '<w:r>' + $rpr + '<w:t xml:space="preserve">' + (Esc $t) + '</w:t></w:r>'
}

# Inline: **bold** segments, plus bold-colored lead labels
function Inline([string]$text, [int]$sz, [string]$color, [bool]$italic) {
  $label = ''
  $m = [regex]::Match($text, '^(PM lens|Optum link|Regulatory link|Anchor|Look for):\s*')
  if ($m.Success) {
    $label = RunX ($m.Groups[1].Value + ': ') $sz $TEAL $true $false
    $text = $text.Substring($m.Length)
  }
  $parts = $text -split '\*\*'
  $x = $label
  for ($k = 0; $k -lt $parts.Length; $k++) {
    if ($parts[$k].Length -eq 0) { continue }
    $x += RunX $parts[$k] $sz $color (($k % 2) -eq 1) $italic
  }
  $x
}

function Para([string]$inner, [string]$ppr) { '<w:p><w:pPr>' + $ppr + '</w:pPr>' + $inner + '</w:p>' }

$sb = New-Object Text.StringBuilder
$bdr = '<w:tcBorders><w:top w:val="single" w:sz="4" w:color="BFBFBF"/><w:left w:val="single" w:sz="4" w:color="BFBFBF"/><w:bottom w:val="single" w:sz="4" w:color="BFBFBF"/><w:right w:val="single" w:sz="4" w:color="BFBFBF"/></w:tcBorders>'

function EmitTable($rows) {
  $header = $rows[0]
  $ncol = $header.Count
  $maxlen = New-Object 'int[]' $ncol
  foreach ($r in $rows) { for ($c = 0; $c -lt $ncol; $c++) { $len = 0; if ($c -lt $r.Count) { $len = $r[$c].Length }; if ($len -gt $maxlen[$c]) { $maxlen[$c] = $len } } }
  $weights = @(); $tot = 0
  for ($c = 0; $c -lt $ncol; $c++) { $w = [Math]::Min([Math]::Max([Math]::Sqrt($maxlen[$c]) * 10, 40), 140); $weights += $w; $tot += $w }
  $widths = @(); $sum = 0
  for ($c = 0; $c -lt $ncol; $c++) { $wd = [int][Math]::Floor(9360 * $weights[$c] / $tot); $widths += $wd; $sum += $wd }
  $widths[$ncol - 1] += (9360 - $sum)
  [void]$sb.Append('<w:tbl><w:tblPr><w:tblW w:w="9360" w:type="dxa"/><w:tblLayout w:type="fixed"/></w:tblPr><w:tblGrid>')
  foreach ($wd in $widths) { [void]$sb.Append('<w:gridCol w:w="' + $wd + '"/>') }
  [void]$sb.Append('</w:tblGrid>')
  for ($ri = 0; $ri -lt $rows.Count; $ri++) {
    $r = $rows[$ri]; $hdr = ($ri -eq 0)
    $tr = '<w:tr>'
    if ($hdr) { $tr = '<w:tr><w:trPr><w:cantSplit/><w:tblHeader/></w:trPr>' } else { $tr = '<w:tr><w:trPr><w:cantSplit/></w:trPr>' }
    for ($c = 0; $c -lt $ncol; $c++) {
      $t = ''; if ($c -lt $r.Count) { $t = $r[$c] }
      $shd = ''; $col = '222222'
      if ($hdr) { $shd = '<w:shd w:val="clear" w:color="auto" w:fill="' + $NAVY + '"/>'; $col = 'FFFFFF' }
      elseif (($ri % 2) -eq 0) { $shd = '<w:shd w:val="clear" w:color="auto" w:fill="F3F6FA"/>' }
      $content = if ($hdr) { RunX $t 17 $col $true $false } else { Inline $t 17 $col $false }
      $tr += '<w:tc><w:tcPr><w:tcW w:w="' + $widths[$c] + '" w:type="dxa"/>' + $bdr + $shd + '<w:tcMar><w:top w:w="50" w:type="dxa"/><w:left w:w="80" w:type="dxa"/><w:bottom w:w="50" w:type="dxa"/><w:right w:w="80" w:type="dxa"/></w:tcMar></w:tcPr><w:p><w:pPr><w:spacing w:before="0" w:after="0"/></w:pPr>' + $content + '</w:p></w:tc>'
    }
    $tr += '</w:tr>'
    [void]$sb.Append($tr)
  }
  [void]$sb.Append('</w:tbl>')
  [void]$sb.Append((Para '' '<w:spacing w:before="0" w:after="60"/>'))
}

# ---- Cover block ----
[void]$sb.Append((Para (RunX 'Optum Lead Technical Product Manager' 48 $NAVY $true $false) '<w:pStyle w:val="Title"/>'))
[void]$sb.Append((Para (RunX 'Top 10 Probable Interview Questions per Sub-category' 30 $ACC $false $false) ('<w:pBdr><w:bottom w:val="single" w:sz="8" w:space="6" w:color="' + $ACC + '"/></w:pBdr><w:spacing w:after="160"/>')))
[void]$sb.Append((Para (RunX 'Prepared 20 October 2026. 270 questions across 27 sub-categories of Healthcare Domain, AI / Gen AI / Agentic AI / ML, Product Management and Technical Expertise, tailored to Optum Global Solutions leaders.' 21 '444444' $false $false) '<w:spacing w:after="120"/>'))

$contents = @(
 'Q1 Healthcare Domain (6 sub-categories, 60 questions)',
 'Q2 AI / Gen AI / Agentic AI / ML (6 sub-categories, 60 questions)',
 'Q3 Product Management (9 sub-categories, 90 questions)',
 'Q4 Technical Expertise (6 sub-categories, 60 questions)',
 'Question types: Conceptual, Technical, Experience, Behavioral. Each question has a Look for line describing what a strong answer contains.')
[void]$sb.Append((Para (RunX 'Contents' 26 $ACC $true $false) '<w:spacing w:before="160" w:after="60"/>'))
foreach ($ct in $contents) {
  [void]$sb.Append((Para (RunX $ct 21 '222222' $false $false) '<w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr><w:spacing w:before="20" w:after="20"/>'))
}
[void]$sb.Append((Para (RunX 'How to use: answer in STAR format for Experience and Behavioral questions, and lead with the headline before the detail for Conceptual and Technical ones. Use the keyword notes document for the underlying content.' 19 $GRAY $false $true) '<w:spacing w:before="160" w:after="60"/>'))

# ---- Body ----
$files = Get-ChildItem $SrcDir -Filter '*.md' | Sort-Object Name
$first = $true
foreach ($f in $files) {
  $lines = [IO.File]::ReadAllLines($f.FullName, [Text.Encoding]::UTF8)
  $tbl = $null
  foreach ($line in $lines) {
    if ($line.TrimStart().StartsWith('|')) {
      $cells = $line.Trim().Trim('|').Split('|') | ForEach-Object { $_.Trim() }
      if (($cells -join '') -match '^[-:\s]+$') { continue }
      if ($null -eq $tbl) { $tbl = New-Object System.Collections.ArrayList }
      [void]$tbl.Add(@($cells))
      continue
    } elseif ($null -ne $tbl) {
      EmitTable $tbl; $tbl = $null
    }
    if ($line.Trim().Length -eq 0) { continue }
    if ($line.StartsWith('# ')) {
      $ppr = '<w:pStyle w:val="Heading1"/><w:pageBreakBefore/>'
      [void]$sb.Append((Para ('<w:r><w:t xml:space="preserve">' + (Esc $line.Substring(2)) + '</w:t></w:r>') $ppr))
    } elseif ($line.StartsWith('## ')) {
      [void]$sb.Append((Para ('<w:r><w:t xml:space="preserve">' + (Esc $line.Substring(3)) + '</w:t></w:r>') '<w:pStyle w:val="Heading2"/>'))
    } elseif ($line.StartsWith('### ')) {
      [void]$sb.Append((Para ('<w:r><w:t xml:space="preserve">' + (Esc $line.Substring(4)) + '</w:t></w:r>') '<w:pStyle w:val="Heading3"/>'))
    } elseif ($line.StartsWith('> ')) {
      $ppr = '<w:keepNext/><w:pBdr><w:left w:val="single" w:sz="24" w:space="8" w:color="' + $ACC + '"/></w:pBdr><w:shd w:val="clear" w:color="auto" w:fill="EAF1F8"/><w:spacing w:before="60" w:after="100"/><w:ind w:left="160"/>'
      [void]$sb.Append((Para (Inline $line.Substring(2) 20 '1F3864' $false) $ppr))
    } elseif ($line.TrimStart().StartsWith('- ')) {
      $indent = $line.Length - $line.TrimStart().Length
      $lvl = [Math]::Min([int][Math]::Floor($indent / 2), 3)
      $txt = $line.TrimStart().Substring(2)
      $sz = 21; $color = '222222'
      if ($lvl -ge 1) { $color = '333333' }
      $before = 20; if ($lvl -eq 0) { $before = 70 }
      $ppr = '<w:numPr><w:ilvl w:val="' + $lvl + '"/><w:numId w:val="1"/></w:numPr><w:spacing w:before="' + $before + '" w:after="20"/>'
      [void]$sb.Append((Para (Inline $txt $sz $color $false) $ppr))
    } else {
      [void]$sb.Append((Para (Inline $line.Trim() 21 '222222' $false) '<w:spacing w:before="40" w:after="60"/>'))
    }
  }
  if ($null -ne $tbl) { EmitTable $tbl; $tbl = $null }
}

$ns = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"'
$sect = '<w:sectPr><w:footerReference w:type="default" r:id="rId3"/><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1260" w:right="1440" w:bottom="1260" w:left="1440" w:header="708" w:footer="708" w:gutter="0"/></w:sectPr>'
$docXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document ' + $ns + '><w:body>' + $sb.ToString() + $sect + '</w:body></w:document>'

$stylesXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
 '<w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:eastAsia="Calibri" w:cs="Calibri"/><w:sz w:val="21"/><w:szCs w:val="21"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="0" w:line="259" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>' +
 '<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style>' +
 '<w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:spacing w:after="80"/></w:pPr><w:rPr><w:b/><w:color w:val="' + $NAVY + '"/><w:sz w:val="48"/><w:szCs w:val="48"/></w:rPr></w:style>' +
 '<w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:pBdr><w:bottom w:val="single" w:sz="6" w:space="4" w:color="' + $ACC + '"/></w:pBdr><w:spacing w:before="0" w:after="140"/><w:outlineLvl w:val="0"/></w:pPr><w:rPr><w:b/><w:color w:val="' + $NAVY + '"/><w:sz w:val="36"/><w:szCs w:val="36"/></w:rPr></w:style>' +
 '<w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:spacing w:before="300" w:after="80"/><w:outlineLvl w:val="1"/></w:pPr><w:rPr><w:b/><w:color w:val="' + $ACC + '"/><w:sz w:val="28"/><w:szCs w:val="28"/></w:rPr></w:style>' +
 '<w:style w:type="paragraph" w:styleId="Heading3"><w:name w:val="heading 3"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:spacing w:before="200" w:after="60"/><w:outlineLvl w:val="2"/></w:pPr><w:rPr><w:b/><w:color w:val="' + $NAVY + '"/><w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr></w:style>' +
 '</w:styles>'

function Lvl([int]$i, [string]$ch, [int]$left) {
  '<w:lvl w:ilvl="' + $i + '"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="' + $ch + '"/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="' + $left + '" w:hanging="270"/></w:pPr><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:hint="default"/></w:rPr></w:lvl>'
}
$numXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:abstractNum w:abstractNumId="0"><w:multiLevelType w:val="hybridMultilevel"/>' +
 (Lvl 0 ([string][char]0x2022) 500) + (Lvl 1 $dash 1000) + (Lvl 2 ([string][char]0x25AA) 1500) + (Lvl 3 ([string][char]0x00B7) 2000) +
 '</w:abstractNum><w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num></w:numbering>'

$gr = '<w:rPr><w:color w:val="' + $GRAY + '"/><w:sz w:val="18"/></w:rPr>'
$footerXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:ftr ' + $ns + '><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r>' + $gr + '<w:t xml:space="preserve">Optum Lead TPM Interview Questions  |  Page </w:t></w:r><w:r>' + $gr + '<w:fldChar w:fldCharType="begin"/></w:r><w:r>' + $gr + '<w:instrText xml:space="preserve"> PAGE </w:instrText></w:r><w:r>' + $gr + '<w:fldChar w:fldCharType="separate"/></w:r><w:r>' + $gr + '<w:t>1</w:t></w:r><w:r>' + $gr + '<w:fldChar w:fldCharType="end"/></w:r></w:p></w:ftr>'

$ctXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/><Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/></Types>'
$relsXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>'
$docRels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/></Relationships>'

if (Test-Path $Out) { Remove-Item $Out -Force }
$zip = [IO.Compression.ZipFile]::Open($Out, 'Create')
$utf8 = New-Object Text.UTF8Encoding($false)
function AddEntry($name, $text) {
  $e = $zip.CreateEntry($name); $s = $e.Open(); $b = $utf8.GetBytes($text); $s.Write($b, 0, $b.Length); $s.Close()
}
AddEntry '[Content_Types].xml' $ctXml
AddEntry '_rels/.rels' $relsXml
AddEntry 'word/document.xml' $docXml
AddEntry 'word/styles.xml' $stylesXml
AddEntry 'word/numbering.xml' $numXml
AddEntry 'word/footer1.xml' $footerXml
AddEntry 'word/_rels/document.xml.rels' $docRels
$zip.Dispose()
"Wrote $Out"
