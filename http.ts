import _ from 'lodash';
import * as parse5 from 'parse5';

import { translateNgaNode } from './transform';
import { isElement, isParentNode } from './utils';

function getArticleTreeTraverse(tree: parse5.DefaultTreeNode) {
  if (tree.nodeName === 'article') {
    return tree;
  }
  if (tree.nodeName === 'blockquote') {
    return tree;
  }
  if (isElement(tree)) {
    const classAttr = tree.attrs.find(v => v.name === 'class');
    if (classAttr && classAttr.value.includes('notes-detail')) {
      return tree;
    }
    if (classAttr && classAttr.value.includes('news_area')) {
      return tree;
    }
    if (classAttr && classAttr.value.includes('article-container')) {
      return tree;
    }
    const idAttr = tree.attrs.find(v => v.name === 'id');
    if (idAttr && idAttr.value === 'mainNews') {
      return tree;
    }
  }
  if (!isParentNode(tree)) {
    return undefined;
  }
  let result;
  _.forEach(tree.childNodes, (node) => {
    if (node) {
      const found = getArticleTreeTraverse(node);
      if (found) {
        result = found;
        return false;
      }
    }
  });
  return result;
}

function getArticleTree(htmlText: string) {
  const htmlTree = <parse5.DefaultTreeDocument>parse5.parse(htmlText);
  const articleTree = getArticleTreeTraverse(htmlTree);
  if (!articleTree) {
    throw new Error('Can\'t find the article.');
  }
  return articleTree;
}

export function pageToNga({ htmlText, url }: { url?: string, htmlText: string }) {
  const tree = getArticleTree(htmlText);
  const sourceStr = url ? `[quote]英文日志：${url}
[/quote]
` : '';
  return `[quote]转载请注明本帖来源NGA[s:a2:poi]
[/quote]
${sourceStr}${translateNgaNode(tree)}`;
}
