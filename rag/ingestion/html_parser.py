"""HTML parser for official BIS web pages and gazette bulletins."""

from dataclasses import dataclass, field
from html.parser import HTMLParser
import re
from typing import Dict, List, Optional


@dataclass
class ParsedHTMLDocument:
    """Clean structured document parsed from raw HTML."""

    title: str
    text: str
    headings: List[Dict[str, str]] = field(default_factory=list)
    meta_tags: Dict[str, str] = field(default_factory=dict)


class _BISHTMLStripper(HTMLParser):
    """Internal HTML parser extracting clean text while suppressing scripts, styles, and chrome."""

    def __init__(self):
        super().__init__()
        self._current_tag = ""
        self._suppress_depth = 0
        self._suppress_tags = {"script", "style", "nav", "footer", "header", "noscript", "svg"}
        self._text_chunks: List[str] = []
        self._headings: List[Dict[str, str]] = []
        self._meta: Dict[str, str] = []
        self._page_title = ""
        self._in_title = False
        self._in_heading = False
        self._current_heading_level = ""
        self._current_heading_text = []

    def handle_starttag(self, tag: str, attrs: list):
        tag_lower = tag.lower()
        self._current_tag = tag_lower

        if tag_lower in self._suppress_tags:
            self._suppress_depth += 1
            return

        if self._suppress_depth > 0:
            return

        if tag_lower == "title":
            self._in_title = True
        elif tag_lower in {"h1", "h2", "h3", "h4", "h5", "h6"}:
            self._in_heading = True
            self._current_heading_level = tag_lower
            self._current_heading_text = []
        elif tag_lower in {"p", "div", "br", "tr", "li"}:
            self._text_chunks.append("\n")
        elif tag_lower == "meta":
            attr_dict = dict(attrs)
            name = attr_dict.get("name") or attr_dict.get("property")
            content = attr_dict.get("content")
            if name and content:
                self._meta.append((name, content))

    def handle_endtag(self, tag: str):
        tag_lower = tag.lower()

        if tag_lower in self._suppress_tags:
            self._suppress_depth = max(0, self._suppress_depth - 1)
            return

        if self._suppress_depth > 0:
            return

        if tag_lower == "title":
            self._in_title = False
        elif tag_lower in {"h1", "h2", "h3", "h4", "h5", "h6"} and self._in_heading:
            heading_text = " ".join(self._current_heading_text).strip()
            if heading_text:
                self._headings.append({
                    "level": self._current_heading_level,
                    "text": heading_text,
                })
            self._in_heading = False
            self._current_heading_text = []
        elif tag_lower in {"p", "div", "table", "ul", "ol"}:
            self._text_chunks.append("\n")

    def handle_data(self, data: str):
        if self._suppress_depth > 0:
            return

        clean_str = data.strip()
        if not clean_str:
            return

        if self._in_title:
            self._page_title += (" " + clean_str)

        if self._in_heading:
            self._current_heading_text.append(clean_str)

        self._text_chunks.append(" " + clean_str + " ")


def parse_html_content(raw_html: str) -> ParsedHTMLDocument:
    """Parse raw HTML string into clean text, title, and headings.

    Args:
        raw_html: Raw HTML page content.

    Returns:
        ParsedHTMLDocument: Structured text and metadata.
    """
    parser = _BISHTMLStripper()
    try:
        parser.feed(raw_html)
    except Exception:
        # Fallback regex strip if HTML is malformed
        clean_text = re.sub(r"<[^>]+>", " ", raw_html)
        clean_text = re.sub(r"\s+", " ", clean_text).strip()
        return ParsedHTMLDocument(title="BIS Document", text=clean_text)

    raw_extracted = "".join(parser._text_chunks)
    # Normalize multiple newlines and spaces
    lines = [re.sub(r"[ \t]+", " ", line).strip() for line in raw_extracted.split("\n")]
    clean_lines = [line for line in lines if line]
    formatted_text = "\n\n".join(clean_lines)

    meta_dict = dict(parser._meta)

    return ParsedHTMLDocument(
        title=parser._page_title.strip() or "BIS Document",
        text=formatted_text,
        headings=parser._headings,
        meta_tags=meta_dict,
    )
