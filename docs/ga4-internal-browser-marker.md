# GA4 Internal Browser Marker

Browsers that visit `/admin` are marked locally with `ipurpose_internal_traffic=1` and are excluded from future GA4 collection on public routes from that browser.

This avoids using city/region as an exclusion rule and does not store an email address or other personal identifier.

To clear the marker manually in a browser, remove the `ipurpose_internal_traffic` localStorage key for the iPurpose domain.
