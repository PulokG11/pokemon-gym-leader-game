param([string]$SrcDir, [string]$Out, [string]$CoverTitle, [string]$CoverSub, [string]$CoverNote, [string]$FooterText)
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$NAVY = '1F3864'; $ACC = '2E75B6'; $GRAY = '6B7280'; $TEAL = '0F6E56'; $LINK = '1F5FA8'
$arrow = [string][char]0x2191
$ell = [string][char]0x2026

function Esc([string]$s) { [Security.SecurityElement]::Escape($s) }

# ---------------- run helpers ----------------
function RunX([string]$t, [int]$sz, [string]$color, [bool]$b, [bool]$i, [bool]$u) {
  $rpr = '<w:rPr>'
  if ($b) { $rpr += '<w:b/>' }
  if ($i) { $rpr += '<w:i/>' }
  $rpr += '<w:color w:val="' + $color + '"/><w:sz w:val="' + $sz + '"/><w:szCs w:val="' + $sz + '"/>'
  if ($u) { $rpr += '<w:u w:val="single"/>' }
  $rpr += '</w:rPr>'
  '<w:r>' + $rpr + '<w:t xml:space="preserve">' + (Esc $t) + '</w:t></w:r>'
}
function LinkRunInternal([string]$anchor, [string]$t, [int]$sz, [string]$color, [bool]$b, [bool]$u) {
  '<w:hyperlink w:anchor="' + $anchor + '" w:history="1">' + (RunX $t $sz $color $b $false $u) + '</w:hyperlink>'
}

$script:ext = New-Object System.Collections.ArrayList
function ExtRid([string]$url) {
  $idx = $script:ext.IndexOf($url)
  if ($idx -lt 0) { [void]$script:ext.Add($url); $idx = $script:ext.Count - 1 }
  return 'rIdX' + $idx
}
$script:codeMap = @{}

# plain text segment with [[code]] and URL handling
function SegRuns([string]$t, [int]$sz, [string]$color, [bool]$b, [bool]$i) {
  $x = ''
  $parts = [regex]::Split($t, '(\[\[[^\]]+\]\]|https?://[^\s\)\]]+)')
  foreach ($p in $parts) {
    if ($p.Length -eq 0) { continue }
    if ($p.StartsWith('[[') -and $p.EndsWith(']]')) {
      $code = $p.Substring(2, $p.Length - 4)
      if ($script:codeMap.ContainsKey($code)) { $x += LinkRunInternal $script:codeMap[$code] $code $sz $LINK $true $true }
      else { $x += RunX $code $sz $color $b $i $false }
    } elseif ($p.StartsWith('http://') -or $p.StartsWith('https://')) {
      $rid = ExtRid $p
      $x += '<w:hyperlink r:id="' + $rid + '" w:history="1">' + (RunX $p $sz $LINK $false $false $true) + '</w:hyperlink>'
    } else {
      $x += RunX $p $sz $color $b $i $false
    }
  }
  return $x
}

function Inline([string]$text, [int]$sz, [string]$color, [bool]$italic) {
  $label = ''
  $m = [regex]::Match($text, '^(PM lens|Optum link|Regulatory link|Anchor|Look for|Record|Draft|If you have no real instance|Fill in|Evidence to be ready for|Reconcile before use|Spoken length|Use for|Situation|Task|Action|Result|Strengthen|Caution|Needs your input|Context you have|The gap|Positioning|Evidence you have|Close the gap|Avoid|Say|How an interviewer reads it):\s*')
  if ($m.Success) {
    $label = RunX ($m.Groups[1].Value + ': ') $sz $TEAL $true $false $false
    $text = $text.Substring($m.Length)
  }
  if ($text.Length -gt 2 -and $text.StartsWith('*') -and $text.EndsWith('*') -and -not $text.StartsWith('**')) { $text = $text.Substring(1, $text.Length - 2); $italic = $true }
  $parts = $text -split '\*\*'
  $x = $label
  for ($k = 0; $k -lt $parts.Length; $k++) {
    if ($parts[$k].Length -eq 0) { continue }
    $isBold = (($k % 2) -eq 1)
    $sub = $parts[$k] -split '(?<!\*)\*(?!\*)'
    for ($j = 0; $j -lt $sub.Length; $j++) {
      if ($sub[$j].Length -eq 0) { continue }
      $x += SegRuns $sub[$j] $sz $color $isBold ($italic -or (($j % 2) -eq 1))
    }
  }
  $x
}
function Para([string]$inner, [string]$ppr) { '<w:p><w:pPr>' + $ppr + '</w:pPr>' + $inner + '</w:p>' }

# ---------------- pass 1: headings, bookmarks, codes ----------------
$files = Get-ChildItem $SrcDir -Filter '*.md' | Sort-Object Name
$entries = New-Object System.Collections.ArrayList
$bmN = 0
foreach ($f in $files) {
  foreach ($line in [IO.File]::ReadAllLines($f.FullName, [Text.Encoding]::UTF8)) {
    $hm = [regex]::Match($line, '^(#{1,3}) (.+)$')
    if (-not $hm.Success) { continue }
    $lvl = $hm.Groups[1].Length
    $txt = $hm.Groups[2].Value.Trim()
    $bmN++
    $bm = 'bm_' + $bmN
    $cm = [regex]::Match($txt, '^([A-Z][A-Z0-9]*(?:\.[0-9]+)*)\.?(\s|$)')
    $code = ''
    if ($cm.Success) { $code = $cm.Groups[1].Value; if (-not $script:codeMap.ContainsKey($code)) { $script:codeMap[$code] = $bm } }
    [void]$entries.Add([pscustomobject]@{ Level = $lvl; Text = $txt; Bm = $bm; Code = $code })
  }
}

# ---------------- TOC ----------------
function TocText([string]$t, [int]$lvl) {
  $max = 118; if ($lvl -eq 2) { $max = 100 }
  if ($t.Length -gt $max) {
    $cut = $t.Substring(0, $max); $sp = $cut.LastIndexOf(' ')
    if ($sp -gt 60) { $cut = $cut.Substring(0, $sp) }
    return $cut.TrimEnd(',', ';', ':') + $ell
  }
  return $t
}
$toc = New-Object Text.StringBuilder
foreach ($e in $entries) {
  $t = TocText $e.Text $e.Level
  switch ($e.Level) {
    1 { $sz = 24; $col = $NAVY; $b = $true;  $ind = 0;   $before = 140; $after = 20 }
    2 { $sz = 21; $col = '2B4C7E'; $b = $true;  $ind = 240; $before = 60;  $after = 10 }
    default { $sz = 17; $col = '333333'; $b = $false; $ind = 560; $before = 0; $after = 0 }
  }
  $fld = '<w:r><w:rPr><w:sz w:val="' + $sz + '"/></w:rPr><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:rPr><w:sz w:val="' + $sz + '"/></w:rPr><w:instrText xml:space="preserve"> PAGEREF ' + $e.Bm + ' \h </w:instrText></w:r><w:r><w:rPr><w:sz w:val="' + $sz + '"/></w:rPr><w:fldChar w:fldCharType="separate"/></w:r><w:r><w:rPr><w:color w:val="' + $col + '"/><w:sz w:val="' + $sz + '"/></w:rPr><w:t>1</w:t></w:r><w:r><w:rPr><w:sz w:val="' + $sz + '"/></w:rPr><w:fldChar w:fldCharType="end"/></w:r>'
  $tab = '<w:r><w:rPr><w:sz w:val="' + $sz + '"/></w:rPr><w:tab/></w:r>'
  $inner = '<w:hyperlink w:anchor="' + $e.Bm + '" w:history="1">' + (RunX $t $sz $col $b $false $false) + $tab + $fld + '</w:hyperlink>'
  $ppr = '<w:tabs><w:tab w:val="right" w:leader="dot" w:pos="9350"/></w:tabs><w:spacing w:before="' + $before + '" w:after="' + $after + '" w:line="240" w:lineRule="auto"/><w:ind w:left="' + $ind + '" w:right="500"/>'
  [void]$toc.Append((Para $inner $ppr))
}

# ---------------- pass 2: body ----------------
$sb = New-Object Text.StringBuilder
$bdr = '<w:tcBorders><w:top w:val="single" w:sz="4" w:color="BFBFBF"/><w:left w:val="single" w:sz="4" w:color="BFBFBF"/><w:bottom w:val="single" w:sz="4" w:color="BFBFBF"/><w:right w:val="single" w:sz="4" w:color="BFBFBF"/></w:tcBorders>'

function EmitTable($rows) {
  $header = $rows[0]; $ncol = $header.Count
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
    if ($hdr) { $tr = '<w:tr><w:trPr><w:cantSplit/><w:tblHeader/></w:trPr>' } else { $tr = '<w:tr><w:trPr><w:cantSplit/></w:trPr>' }
    for ($c = 0; $c -lt $ncol; $c++) {
      $t = ''; if ($c -lt $r.Count) { $t = $r[$c] }
      $shd = ''; $col = '222222'
      if ($hdr) { $shd = '<w:shd w:val="clear" w:color="auto" w:fill="' + $NAVY + '"/>'; $col = 'FFFFFF' }
      elseif (($ri % 2) -eq 0) { $shd = '<w:shd w:val="clear" w:color="auto" w:fill="F3F6FA"/>' }
      if ($hdr) { $content = RunX $t 17 $col $true $false $false } else { $content = Inline $t 17 $col $false }
      $tr += '<w:tc><w:tcPr><w:tcW w:w="' + $widths[$c] + '" w:type="dxa"/>' + $bdr + $shd + '<w:tcMar><w:top w:w="50" w:type="dxa"/><w:left w:w="80" w:type="dxa"/><w:bottom w:w="50" w:type="dxa"/><w:right w:w="80" w:type="dxa"/></w:tcMar></w:tcPr><w:p><w:pPr><w:spacing w:before="0" w:after="0"/></w:pPr>' + $content + '</w:p></w:tc>'
    }
    [void]$sb.Append($tr + '</w:tr>')
  }
  [void]$sb.Append('</w:tbl>')
  [void]$sb.Append((Para '' '<w:spacing w:before="0" w:after="60"/>'))
}

$script:curH1 = ''; $script:curH2 = ''; $script:curLvl = 0; $script:had = $false
function FlushBack() {
  if (-not $script:had) { return }
  $x = LinkRunInternal 'toc_top' ($arrow + ' Back to Contents') 17 $ACC $false $true
  if ($script:curLvl -ge 2 -and $script:curH1 -ne '') {
    $x += RunX '   |   ' 17 $GRAY $false $false $false
    $x += LinkRunInternal $script:curH1 ($arrow + ' Back to category') 17 $ACC $false $true
  }
  if ($script:curLvl -ge 3 -and $script:curH2 -ne '') {
    $x += RunX '   |   ' 17 $GRAY $false $false $false
    $x += LinkRunInternal $script:curH2 ($arrow + ' Back to sub-category') 17 $ACC $false $true
  }
  [void]$sb.Append((Para $x '<w:keepLines/><w:spacing w:before="60" w:after="200"/><w:jc w:val="right"/>'))
  $script:had = $false
}

$hIdx = 0
foreach ($f in $files) {
  $lines = [IO.File]::ReadAllLines($f.FullName, [Text.Encoding]::UTF8)
  $tbl = $null
  foreach ($line in $lines) {
    if ($line.TrimStart().StartsWith('|')) {
      $cells = $line.Trim().Trim('|').Split('|') | ForEach-Object { $_.Trim() }
      if (($cells -join '') -match '^[-:\s]+$') { continue }
      if ($null -eq $tbl) { $tbl = New-Object System.Collections.ArrayList }
      [void]$tbl.Add(@($cells)); continue
    } elseif ($null -ne $tbl) { EmitTable $tbl; $tbl = $null; $script:had = $true }
    if ($line.Trim().Length -eq 0) { continue }
    $hm = [regex]::Match($line, '^(#{1,3}) (.+)$')
    if ($hm.Success) {
      FlushBack
      $e = $entries[$hIdx]; $hIdx++
      $lvl = $e.Level
      $ppr = '<w:pStyle w:val="Heading' + $lvl + '"/>'
      if ($lvl -eq 1) { $ppr += '<w:pageBreakBefore/>' }
      $id = $hIdx
      $inner = '<w:bookmarkStart w:id="' + $id + '" w:name="' + $e.Bm + '"/><w:r><w:t xml:space="preserve">' + (Esc $e.Text) + '</w:t></w:r><w:bookmarkEnd w:id="' + $id + '"/>'
      [void]$sb.Append((Para $inner $ppr))
      if ($lvl -eq 1) { $script:curH1 = $e.Bm; $script:curH2 = '' }
      if ($lvl -eq 2) { $script:curH2 = $e.Bm }
      $script:curLvl = $lvl
      continue
    }
    $script:had = $true
    if ($line.StartsWith('> ')) {
      $ppr = '<w:keepNext/><w:pBdr><w:left w:val="single" w:sz="24" w:space="8" w:color="' + $ACC + '"/></w:pBdr><w:shd w:val="clear" w:color="auto" w:fill="EAF1F8"/><w:spacing w:before="60" w:after="100"/><w:ind w:left="160"/>'
      [void]$sb.Append((Para (Inline $line.Substring(2) 20 $NAVY $false) $ppr))
    } elseif ($line.TrimStart().StartsWith('- ')) {
      $indent = $line.Length - $line.TrimStart().Length
      $lvl = [Math]::Min([int][Math]::Floor($indent / 2), 3)
      $txt = $line.TrimStart().Substring(2)
      $color = '222222'; if ($lvl -ge 1) { $color = '333333' }
      $before = 20; if ($lvl -eq 0) { $before = 70 }
      $ppr = '<w:numPr><w:ilvl w:val="' + $lvl + '"/><w:numId w:val="1"/></w:numPr><w:spacing w:before="' + $before + '" w:after="20"/>'
      [void]$sb.Append((Para (Inline $txt 21 $color $false) $ppr))
    } else {
      [void]$sb.Append((Para (Inline $line.Trim() 21 '222222' $false) '<w:spacing w:before="40" w:after="60"/>'))
    }
  }
  if ($null -ne $tbl) { EmitTable $tbl; $tbl = $null; $script:had = $true }
}
FlushBack

# ---------------- front matter ----------------
$front = New-Object Text.StringBuilder
[void]$front.Append((Para (RunX $CoverTitle 48 $NAVY $true $false $false) '<w:pStyle w:val="Title"/>'))
[void]$front.Append((Para (RunX $CoverSub 30 $ACC $false $false $false) ('<w:pBdr><w:bottom w:val="single" w:sz="8" w:space="6" w:color="' + $ACC + '"/></w:pBdr><w:spacing w:after="160"/>')))
[void]$front.Append((Para (RunX $CoverNote 20 '444444' $false $false $false) '<w:spacing w:after="160"/>'))
# quick-jump line (categories)
$qj = RunX 'Jump to: ' 19 $GRAY $true $false $false
$first = $true
foreach ($e in $entries) {
  if ($e.Level -ne 1) { continue }
  $short = $e.Text -replace ":.*$", ""
  if ($short -like "A6.*") { $short = "A6. Other-role questions" }
  if ($short -like "A7.*") { $short = "A7. Notes and sources" }
  if ($short.Length -gt 40) { $short = $short.Substring(0, 40) }
  if (-not $first) { $qj += RunX '  |  ' 19 $GRAY $false $false $false }
  $qj += LinkRunInternal $e.Bm $short 19 $LINK $false $true
  $first = $false
}
[void]$front.Append((Para $qj '<w:spacing w:after="120"/>'))
$tocHead = '<w:bookmarkStart w:id="9000" w:name="toc_top"/><w:r><w:t>Contents</w:t></w:r><w:bookmarkEnd w:id="9000"/>'
[void]$front.Append((Para $tocHead '<w:pStyle w:val="TOCTitle"/>'))
[void]$front.Append($toc.ToString())

$ns = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"'
$sect = '<w:sectPr><w:footerReference w:type="default" r:id="rId3"/><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1260" w:right="1440" w:bottom="1260" w:left="1440" w:header="708" w:footer="708" w:gutter="0"/></w:sectPr>'
$docXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document ' + $ns + '><w:body>' + $front.ToString() + $sb.ToString() + $sect + '</w:body></w:document>'

$stylesXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
 '<w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:eastAsia="Calibri" w:cs="Calibri"/><w:sz w:val="21"/><w:szCs w:val="21"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="0" w:line="259" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>' +
 '<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style>' +
 '<w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:spacing w:after="80"/></w:pPr><w:rPr><w:b/><w:color w:val="' + $NAVY + '"/><w:sz w:val="48"/><w:szCs w:val="48"/></w:rPr></w:style>' +
 '<w:style w:type="paragraph" w:styleId="TOCTitle"><w:name w:val="Contents Title"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:pBdr><w:bottom w:val="single" w:sz="6" w:space="4" w:color="' + $ACC + '"/></w:pBdr><w:spacing w:before="120" w:after="120"/></w:pPr><w:rPr><w:b/><w:color w:val="' + $NAVY + '"/><w:sz w:val="36"/><w:szCs w:val="36"/></w:rPr></w:style>' +
 '<w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:pBdr><w:bottom w:val="single" w:sz="6" w:space="4" w:color="' + $ACC + '"/></w:pBdr><w:spacing w:before="0" w:after="140"/><w:outlineLvl w:val="0"/></w:pPr><w:rPr><w:b/><w:color w:val="' + $NAVY + '"/><w:sz w:val="36"/><w:szCs w:val="36"/></w:rPr></w:style>' +
 '<w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:spacing w:before="300" w:after="80"/><w:outlineLvl w:val="1"/></w:pPr><w:rPr><w:b/><w:color w:val="' + $ACC + '"/><w:sz w:val="28"/><w:szCs w:val="28"/></w:rPr></w:style>' +
 '<w:style w:type="paragraph" w:styleId="Heading3"><w:name w:val="heading 3"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:spacing w:before="220" w:after="60"/><w:outlineLvl w:val="2"/></w:pPr><w:rPr><w:b/><w:color w:val="' + $NAVY + '"/><w:sz w:val="23"/><w:szCs w:val="23"/></w:rPr></w:style>' +
 '</w:styles>'

function Lvl([int]$i, [string]$ch, [int]$left) {
  '<w:lvl w:ilvl="' + $i + '"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="' + $ch + '"/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="' + $left + '" w:hanging="270"/></w:pPr><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:hint="default"/></w:rPr></w:lvl>'
}
$dash = [string][char]0x2013
$numXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:abstractNum w:abstractNumId="0"><w:multiLevelType w:val="hybridMultilevel"/>' +
 (Lvl 0 ([string][char]0x2022) 500) + (Lvl 1 $dash 1000) + (Lvl 2 ([string][char]0x25AA) 1500) + (Lvl 3 ([string][char]0x00B7) 2000) +
 '</w:abstractNum><w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num></w:numbering>'

$gr = '<w:rPr><w:color w:val="' + $GRAY + '"/><w:sz w:val="18"/></w:rPr>'
$footerXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:ftr ' + $ns + '><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:hyperlink w:anchor="toc_top" w:history="1"><w:r>' + $gr + '<w:t xml:space="preserve">' + (Esc ($arrow + ' Contents')) + '</w:t></w:r></w:hyperlink><w:r>' + $gr + '<w:t xml:space="preserve">     |     ' + (Esc $FooterText) + '  |  Page </w:t></w:r><w:r>' + $gr + '<w:fldChar w:fldCharType="begin"/></w:r><w:r>' + $gr + '<w:instrText xml:space="preserve"> PAGE </w:instrText></w:r><w:r>' + $gr + '<w:fldChar w:fldCharType="separate"/></w:r><w:r>' + $gr + '<w:t>1</w:t></w:r><w:r>' + $gr + '<w:fldChar w:fldCharType="end"/></w:r></w:p></w:ftr>'

$ctXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/><Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/></Types>'
$relsXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>'
$docRels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/>'
for ($k = 0; $k -lt $script:ext.Count; $k++) {
  $docRels += '<Relationship Id="rIdX' + $k + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="' + (Esc $script:ext[$k]) + '" TargetMode="External"/>'
}
$docRels += '</Relationships>'

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
"Wrote $Out | headings: $($entries.Count) | codes: $($script:codeMap.Count) | external links: $($script:ext.Count)"
