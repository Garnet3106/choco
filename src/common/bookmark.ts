import { SearchItem, SearchItemType, Website } from './search';

export namespace Bookmark {
  export async function getAll(hideNotificationCountInTitle: boolean): Promise<Website[]> {
    const tree = await chrome.bookmarks.getTree();
    return getNodeChildren(tree[0], hideNotificationCountInTitle);
  }

  export function getNodeChildren(node: chrome.bookmarks.BookmarkTreeNode, hideNotificationCountInTitle: boolean): Website[] {
    let children: Website[] = [];

    if (node.url) {
      children.push({
        title: hideNotificationCountInTitle ? Website.removeNotificationCountFromTitle(node.title) : node.title,
        url: node.url,
      });
    }

    if (node.children) {
      const newChildren = node.children.map((eachNode) => getNodeChildren(eachNode, hideNotificationCountInTitle));
      children = children.concat(...newChildren);
    }

    return children;
  }

  export async function search(keywords: string[], max: number, hideNotificationCountInTitle: boolean): Promise<SearchItem[]> {
    const all = await getAll(hideNotificationCountInTitle);

    return all
      .filter((eachWebsite) => Website.match(eachWebsite, keywords))
      .splice(0, max)
      .map((eachWebsite) => ({
        type: SearchItemType.Bookmark,
        website: eachWebsite,
      }));
  }
}
