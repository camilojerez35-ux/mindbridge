// Stub for react-test-renderer — required by @testing-library/react-native
const React = require('react');

function create(element) {
  return {
    toJSON: () => elementToJSON(element),
    root: { findAllByType: () => [], findByType: () => null },
    update: () => {},
    unmount: () => {},
  };
}

function elementToJSON(element) {
  if (!element) return null;
  if (typeof element === 'string' || typeof element === 'number') return String(element);
  if (!React.isValidElement(element)) return null;
  const { type, props } = element;
  const typeName = typeof type === 'string' ? type : type?.displayName || type?.name || 'Unknown';
  const { children, ...rest } = props;
  const childArray = children ? (Array.isArray(children) ? children : [children]) : [];
  return {
    type: typeName,
    props: rest,
    children: childArray.map(elementToJSON).filter(Boolean),
  };
}

module.exports = { create, act: (fn) => fn() };
