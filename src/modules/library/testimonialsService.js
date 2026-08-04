import { MOCK_TESTIMONIALS } from '../../utils/mockData';

// Read-only content (no create/update/delete exists for testimonials today),
// but still routed through a function boundary rather than imported directly
// by the page, so a real CMS-backed source can replace this later without
// touching LibraryPage.jsx.
export function getTestimonials() {
  return MOCK_TESTIMONIALS;
}
