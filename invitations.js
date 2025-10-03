// invitations.js
// Handles 'View Example' placeholders if not yet linked.
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-example]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const type = btn.getAttribute('data-example');
      // Update with your final links; temporary heads-up:
      e.preventDefault();
      alert(`Example for "${type}" coming soon. Replace the button href with your live demo URL when ready.`);
    });
  });
});