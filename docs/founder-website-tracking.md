# Founder website referral tracking

The About page's "Visit MsHmltn.com" link records `founder_website_click` in the existing GA4 destinations. In Google Analytics, view that event's **Event count** for link activations and **Total users** for measured users during the selected date range. Repeated clicks are separate activations; user counts are analytics identifiers, not verified distinct people. This event is separate from the fixed weekly signup and Clarity snapshot metrics.

The destination URL carries these source tags:
- `utm_source=ipurpose`
- `utm_medium=referral`
- `utm_campaign=founder_profile`
- `utm_content=about_founder_link`

MsHmltn.com's own analytics can use these tags to report arrivals from this exact link. An outbound click on iPurpose does not prove the destination loaded. Tracking begins at deployment; earlier clicks cannot be recovered by this change.

The event includes only the fixed link URL, domain, ID, source page and outbound flag. It uses the existing owner/admin and QA exclusions, waits for GA4 readiness, and requests beacon delivery during navigation. Blocked or unavailable analytics may miss clicks. Native anchor navigation remains available even without JavaScript or when analytics fails.
