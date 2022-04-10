function isTestIdentifier({ object }) {
  return object && object.type === 'Identifier' && object.name === 'test';
}

function isDescribeIdentifier({ object }) {
  return (
    object &&
    object.property &&
    object.property.type === 'Identifier' &&
    object.property.name === 'describe'
  );
}

function hasSkippedTest(node) {
  return (
    (isDescribeIdentifier(node) || isTestIdentifier(node)) &&
    node.property.type === 'Identifier' &&
    node.property.name === 'skip'
  );
}

module.exports = {
  create(context) {
    return {
      MemberExpression(node) {
        if (hasSkippedTest(node)) {
          context.report({ messageId: 'noSkippedTest', node });
        }
      },
    };
  },
  meta: {
    docs: {
      category: 'Possible Errors',
      description: 'Disallow usage of skip annotation (e.g `test.skip` or `test.describe.skip`)',
      recommended: true,
    },
    messages: {
      noSkippedTest: 'disallow usage of skipped tests',
    },
    type: 'problem',
  },
};
