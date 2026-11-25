# Day 2: Layout Stacking + Modals - TODO

## 1. About Modal Bottom Sheet (All Pages) ✅
- [x] index.css has bottom-sheet for `.about-modal` at max-width: 1024px
- [x] Added to card-library.css for card-library.html
- [x] Added to deckbuilder.css for deckbuilder.html
- [x] Added to tournaments.css for tournaments.html (besides existing inline)
- [x] Added to quiz.css for quiz.html

## 2. Admin Modal Bottom Sheet (tournaments.html) ✅
- [x] Added bottom-sheet styles for `#admin-modal .about-modal` in tournaments.css

## 3. Update Modal Bottom Sheet (tournaments.html) ✅
- [x] Added bottom-sheet styles for `#update-modal .about-modal` in tournaments.css

## 4. Visual Deck Modal Bottom Sheet (deckbuilder.html) ✅
- [x] Added bottom-sheet styles for `#visual-deck-modal` in deckbuilder.css

## 5. Test Hand Modal Bottom Sheet (deckbuilder.html) ✅
- [x] Added bottom-sheet styles for `#test-hand-modal` in deckbuilder.css

## 6. Tablet Breakpoints (700px-1024px) - IN PROGRESS
- [x] Card grid on index.html - uses `repeat(auto-fill, minmax(150px, 1fr))` at 1024px ✓
- [ ] Card grid on card-library.html - check tablet layout (currently uses 1fr at 1024px, should be 2-col)
- [x] Card grid on deckbuilder.html - uses auto-fill minmax(150px, 1fr) at 1199px, then 2-col at 700px ✓
- [x] Card grid on tournaments.html - already 2-col at 1025px ✓

## 7. Touch Target Verification ✅
- [x] Close buttons on all modals ≥48px (added to component.css .btn-close-modal)
- [x] Input fields font-size 16px to prevent iOS zoom (added to component.css mobile media query)
- [x] Added touch target minimums for buttons, chips, tabs, inputs in component.css @media (max-width: 1024px)
- [x] Added font-size 16px for inputs in quiz.css

## 8. Card Library - Tablet Grid Layout
- [ ] card-library.html uses vertical card-list, not grid - no change needed