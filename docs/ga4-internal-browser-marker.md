# GA4 Internal and QA Browser Markers

Browsers that visit `/admin` are marked locally with `ipurpose_internal_traffic=1` and are excluded from future GA4 collection on public routes from that browser.

Known QA browsers are also excluded. A browser is marked with `ipurpose_qa_traffic=1` when a page is opened with either `utm_source=codex_qa` or the explicit `ipurpose_qa=1` switch. Once marked, that browser remains excluded from future GA4 collection until the marker is cleared.

This avoids using city/region as an exclusion rule and does not store an email address, user ID, IP address, or other personal identifier.

Data-center-looking traffic is not automatically excluded by geography. It should be flagged and reviewed separately in reporting unless there is a known QA/test source or another explicit internal signal.

To clear the markers manually in a browser, remove `ipurpose_internal_traffic` and/or `ipurpose_qa_traffic` from localStorage for the iPurpose domain.
