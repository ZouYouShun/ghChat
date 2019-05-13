import React, { Component } from 'react';
import {
  withRouter,
} from 'react-router-dom';
import PropTypes from 'prop-types';
import { Emoji } from 'emoji-mart';
import { MultiLineParser } from 'text-emoji-parser';
import UserAvatar from '../UserAvatar';
import './style.scss';
import Chat from '../../modules/Chat';
import { hrefToAnchor } from '../../utils/hrefToAnchor';

class ChatItem extends Component {
  constructor(props) {
    super(props);
    this._scrollIntoView = null;
    this._chat = new Chat();
  }

  clickToInvite({ redirectUrl }) {
    this.props.history.push(redirectUrl);
  }

  _clickImage(imageUrl) {
    this.props.clickImage(imageUrl);
  }

  invitePersonalCard = (inviteObj) => {
    const { name, avatar, user_id } = inviteObj;
    const redirectUrl = `/private_chat/${user_id}`;
    return (
      <div
        className="inviteCard"
        onClick={() => { this.clickToInvite({ redirectUrl }); }}
        >
        <p className="inviteTitle">
          {` "${decodeURI(name)}"`}
        </p>
        <p className="inviteButton">点击加为联系人</p>
      </div>
    );
  }

  inviteGroupCard = (inviteObj) => {
    const { name, to_group_id } = inviteObj;
    const redirectUrl = `/group_chat/${to_group_id}`;
    return (
      <div
        className="inviteCard"
        onClick={() => { this.clickToInvite({ redirectUrl }); }}
        >
        <p>
          邀请你加入群:
        </p>
        <p className="inviteTitle">
          {` "${decodeURI(name)}"`}
        </p>
        <p className="inviteButton">点击加入</p>
      </div>
    );
  }

  _onloadImg = () => {
    // TODO: just the latest image should scrollIntoView.
    clearTimeout(this._scrollIntoView);
    this._scrollIntoView = setTimeout(() => {
      const imgDom = document.querySelectorAll('.image-render');
      if (imgDom[imgDom.length - 1] && this.props.shouldScrollIntoView) {
        imgDom[imgDom.length - 1].scrollIntoView();
        this._chat.scrollToBottom();
      }
    }, 0);
  }

  textRender = (msg) => {
    msg = hrefToAnchor(msg);
    const isInviteUrl = /^::invite::{"/.test(msg);
    if (isInviteUrl) {
      const inviteObj = JSON.parse(msg.replace(/::invite::/, ''));
      if (inviteObj.to_group_id) {
        return <div className="msg-render">{this.inviteGroupCard(inviteObj)}</div>;
      } if (inviteObj.user_id) {
        return <div className="msg-render">{this.invitePersonalCard(inviteObj)}</div>;
      }
    }
    return (
      <div className="msg-render">
        {MultiLineParser(msg,
          {
            SplitLinesTag: 'p',
            Rule: /(?:\:[^\:]+\:(?:\:skin-tone-(?:\d)\:)?)/gi
          },
          (Rule, ruleNumber) => (
            <Emoji
              className="msg-render"
              emoji={Rule}
              backgroundImageFn={() => 'https://cdn.aermin.top/emojione.png'}
              size={26}
              fallback={(emoji, props) => (emoji ? `:${emoji.short_names[0]}:` : props.emoji)} />
          ))
    }
      </div>
    );
  };

  filesRender = attachments => attachments.map((attachment) => {
    if (attachment.type === 'image') {
      return (
        <div className="image-render" key={attachment.fileUrl} onClick={() => { this._clickImage(attachment.fileUrl); }}>
          <img src={attachment.fileUrl} onLoad={this._onloadImg} />
        </div>
      );
    }
    return (
      <a
        key={attachment.fileUrl}
        download
        href={`${attachment.fileUrl}?attname=${attachment.name}`}
        className="other-file-render"
      >
        {attachment.name || 'unknown file'}
        <svg className="icon" aria-hidden="true"><use xlinkHref="#icon-download" /></svg>
      </a>
    );
  })

  render() {
    const {
      me, img, time, name, msg, clickAvatar, github_id
    } = this.props;
    let attachments = this.props.attachments;
    if (typeof attachments === 'string') {
      attachments = JSON.parse(attachments);
    }
    // TODO: reduce needless render
    // console.log('attachments in chatItem', attachments);

    return (
      <div className="chat-item">
        {me ? (
          <div className="mychat">
            <UserAvatar name={name} src={img} size="40" showLogo={!!github_id} />
            <div className="nt">
              {time && <span>{time}</span>}
              {name && <span>{name}</span>}
            </div>
            {attachments.length ? this.filesRender(attachments)
              : this.textRender(msg)
            }
          </div>
        ) : (
          <div className="otherchat">
            <UserAvatar name={name} src={img} size="40" clickAvatar={clickAvatar} showLogo={!!github_id} />
            <div className="nt">
              {name && <span>{ name }</span>}
              {time && <span>{ time }</span>}
            </div>
            {attachments.length ? this.filesRender(attachments)
              : this.textRender(msg)
            }
          </div>
        )}
      </div>
    );
  }
}

export default withRouter(ChatItem);

ChatItem.propTypes = {
  me: PropTypes.bool,
  img: PropTypes.string,
  name: PropTypes.string,
  time: PropTypes.string,
  msg: PropTypes.string,
  attachments: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array
  ]),
  clickAvatar: PropTypes.func,
  github_id: PropTypes.number,
  shouldScrollIntoView: PropTypes.bool,
  clickImage: PropTypes.func,
};

ChatItem.defaultProps = {
  me: undefined,
  img: undefined,
  name: '',
  time: undefined,
  clickAvatar: undefined,
  msg: '',
  attachments: '[]',
  github_id: null,
  shouldScrollIntoView: true,
  clickImage() {},
};
