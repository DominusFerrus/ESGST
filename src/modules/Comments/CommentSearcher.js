import Module from '../../class/Module';
import Process from '../../class/Process';
import { common } from '../Common';

const
  createElements = common.createElements.bind(common),
  endless_load = common.endless_load.bind(common)
  ;

class CommentsCommentSearcher extends Module {
  constructor() {
    super();
    this.info = {
      description: [
        [`ul`, [
          [`li`, [
            `Adds a button (`,
            [`i`, { class: `fa fa-comments` }],
            ` `,
            [`i`, { class: `fa fa-search` }],
            `) to the main page heading of any page that allows you to search for comments made by specific users in the page.`
          ]]
        ]]
      ],
      id: `cs`,
      load: this.cs,
      name: `Comment Searcher`,
      sg: true,
      st: true,
      type: `comments`
    };
  }

  cs() {
    if (!this.esgst.commentsPath || (this.esgst.giveawayPath && document.getElementsByClassName(`table--summary`)[0])) return;
    new Process({
      headingButton: {
        id: `cs`,
        icons: [`fa-comments`, `fa-search`],
        title: `Search comments from specific users`
      },
      popup: {
        icon: `fa-comments`,
        title: `Search comments from specific users:`,
        textInputs: [
          {
            placeholder: `username1, username2, ...`
          }
        ],
        options: [
          {
            check: true,
            description: [{
              text: `Limit search by pages, from `,
              type: `node`
            }, {
              attributes: {
                class: `esgst-switch-input`,
                min: `i`,
                name: `cs_minPage`,
                type: `number`,
                value: this.esgst.cs_minPage
              },
              type: `input`
            }, {
              text: ` to `,
              type: `node`
            }, {
              attributes: {
                class: `esgst-switch-input`,
                min: `i`,
                name: `cs_maxPage`,
                type: `number`,
                value: this.esgst.cs_maxPage
              },
              type: `input`
            }, {
              text: `.`,
              type: `node`
            }],
            id: `cs_limitPages`,
            tooltip: `If unchecked, all pages will be searched.`
          }
        ],
        addProgress: true,
        addScrollable: `left`
      },
      init: this.cs_init.bind(this),
      requests: [
        {
          source: this.esgst.discussionPath,
          url: this.esgst.searchUrl,
          request: this.cs_request.bind(this)
        }
      ]
    });
  }

  cs_init(obj) {
    obj.usernames = obj.popup.getTextInputValue(0)
      .toLowerCase()
      .replace(/(,\s*)+/g, this.cs_format.bind(this))
      .split(`, `);
    let match = window.location.pathname.match(/^\/(giveaway|discussion|support\/ticket|trade)\/(.+?)\//);
    obj.code = match[2];
    obj.type = match[1];
    obj.title = this.esgst.originalTitle.replace(/\s-\sPage\s\d+/, ``);
    obj.results = 0;
    if (this.esgst.cs_limitPages) {
      obj.requests[0].nextPage = this.esgst.cs_minPage;
      obj.requests[0].maxPage = this.esgst.cs_maxPage;
    }
  }

  cs_format(match, p1, offset, string) {
    return (((offset === 0) || (offset === (string.length - match.length))) ? `` : `, `);
  }

  async cs_request(obj, details, response, responseHtml) {
    obj.popup.setProgress(`Searching comments (page ${details.nextPage}${details.maxPage ? ` of ${details.maxPage}` : details.lastPage})..`);
    obj.popup.setOverallProgress(`${obj.results} results found.`);
    let comments = responseHtml.getElementsByClassName(`comments`);
    let elements = (comments[1] || comments[0]).querySelectorAll(`.comment:not(.comment--submit), .comment_outer`);
    let context = obj.popup.getScrollable();
    for (let i = 0, n = elements.length; i < n; i++) {
      let element = elements[i];
      if (this.esgst.sg) {
        element.firstElementChild.classList.remove(`comment__parent`);
        element.firstElementChild.classList.add(`comment__child`);
      }
      let parent = element.parentElement.closest(`.comment, .comment_outer`);
      element = element.cloneNode(true);
      element.lastElementChild.innerHTML = ``;
      const items = [{
        attributes: {
          class: `comment comments comment_outer`
        },
        type: `div`,
        children: []
      }];
      if (parent) {
        parent = parent.cloneNode(true);
        parent.lastElementChild.remove();
        createElements(parent, `beforeEnd`, [{
          attributes: {
            class: `comment__children comment_children`
          },
          type: `div`,
          children: [{
            context: element
          }]
        }]);
        items[0].children.push({
          context: parent
        });
      } else {
        if (this.esgst.st) {
          createElements(element.getElementsByClassName(`action_list`)[0].firstElementChild, `afterEnd`, [{
            attributes: {
              href: `/${obj.type}/${obj.code}/`
            },
            text: `${obj.title} - Page ${details.nextPage}`,
            type: `a`
          }]);
        }
        if (this.esgst.sg) {
          items[0].children.push({
            attributes: {
              class: `comments__entity`
            },
            type: `div`,
            children: [{
              attributes: {
                class: `comments__entity__name`
              },
              type: `p`,
              children: [{
                attributes: {
                  href: `/${obj.type}/${obj.code}/`
                },
                text: `${obj.title} - Page ${details.nextPage}`,
                type: `a`
              }]
            }]
          });
        }
        items[0].children.push({
          attributes: {
            class: `comment__children comment_children`
          },
          type: `div`,
          children: [{
            context: element
          }]
        });
      }
      if (obj.usernames.indexOf(element.querySelector(`.comment__username, .author_name`).textContent.trim().toLowerCase()) > -1) {
        createElements(context, `beforeEnd`, items);
        obj.results += 1;
      }
    }
    obj.popup.setOverallProgress(`${obj.results} results found.`);
    await endless_load(context);
  }
}

export default CommentsCommentSearcher;