# Documentation navigation

## Current owner direction

25 October 2026: Martlet uses jameshoward.us as the light-appearance reference and reverses its foreground/background relationship in dark appearance. At the top it is transparent; after `min(260px, max(160px, 25% of viewport height))` of scrolling, or while its mobile menu is open, light appearance uses the original navy-950 surface (`#07111f`) with white links; dark appearance fades to an edge-to-edge white surface with dark links. Both retain the gold current/hover rule. The surface fades over 0.5 seconds; reduced motion removes the visible fade. Initial/deep-link and restored-page scroll position must determine the initial state. Closing the menu restores the appropriate scroll state.

The homepage hero reaches the top edge beneath transparent navigation. Light appearance uses a dark native hero surface with light lettering, as on the origin; dark appearance uses a lighter native cream surface with dark lettering. Plain non-hero documentation pages retain appropriate transparent-header contrast. The mode reversal is explicit owner direction, not a claim that the origin already implements a dark counterpart. Existing narrow/enlarged-text reflow remains a documentation-host accommodation.

Krigsvold restores a contained menu floating over the hero, which begins at the top edge of the viewport. In light appearance the menu uses the origin dark navy surface with white lettering. In dark appearance it inverts to white with dark lettering. Both appearances retain the same floating geometry; non-hero pages retain ordinary document flow. Its desktop dropdowns remain white; mobile submenus remain transparent and in flow. Existing homepage specimen appearance controls retain their existing specimen scope.

These are documentation-host choices, not universal application frames. Original websites and adopting applications keep their own host identity and justified frame choices.

## Superseded choice

The earlier 25 October white/grey direction had been applied to both families. The owner subsequently chose “Match jameshoward.us” for Martlet after identifying the all-mode scroll/color mismatch. The owner then corrected Krigsvold to the floating, inverse-appearance menu shown on the origin hero. Both earlier white/grey band choices are now superseded. Do not restore them through a later consistency audit.
