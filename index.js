import { tweetsData as initialTweetsData } from "./data.js";
import { v4 as uuidv4 } from "https://jspm.dev/uuid";

let savedTweets = JSON.parse(localStorage.getItem("tweetsData"));
let tweetsData = savedTweets ? savedTweets : initialTweetsData.slice();
let openReplies = {};

document.addEventListener("click", function (e) {
  if (e.target.dataset.like) {
    handleLikeClick(e.target.dataset.like);
  } else if (e.target.dataset.retweet) {
    handleRetweetClick(e.target.dataset.retweet);
  } else if (e.target.dataset.reply) {
    toggleReplyBox(e.target.dataset.reply);
  } else if (e.target.id === "tweet-btn") {
    handleTweetBtnClick();
  } else if (e.target.dataset.delete) {
    handleDeleteClick(e.target.dataset.delete);
  } else if (e.target.dataset.addreply) {
    handleAddReplyClick(e.target.dataset.addreply);
  } else if (e.target.dataset.deletereply) {
    handleDeleteReplyClick(e.target.dataset.deletereply);
  }
});

function handleLikeClick(tweetId) {
  for (let tweet of tweetsData) {
    if (tweet.uuid === tweetId) {
      tweet.isLiked = !tweet.isLiked;
      tweet.likes += tweet.isLiked ? 1 : -1;
      break;
    }
  }
  saveAndRender();
}

function handleRetweetClick(tweetId) {
  let tweetToRetweet = tweetsData.find(tweet => tweet.uuid === tweetId);

  if (tweetToRetweet) {
    tweetToRetweet.isRetweeted = !tweetToRetweet.isRetweeted;
    tweetToRetweet.retweets += tweetToRetweet.isRetweeted ? 1 : -1;

    if (tweetToRetweet.isRetweeted) {
      tweetsData.unshift({
        handle: "@Cosminrotaru",
        profilePic: "images/profil.jpeg",
        likes: 0,
        retweets: 0,
        tweetText: `🔁 @Cosminrotaru a repostat:\n\n"${tweetToRetweet.tweetText}"`,
        replies: [],
        isLiked: false,
        isRetweeted: false,
        uuid: `retweet-${tweetId}`, 
      });
    } else {
      tweetsData = tweetsData.filter(tweet => tweet.uuid !== `retweet-${tweetId}`);
    }
  }

  saveAndRender();
}

function toggleReplyBox(tweetId) {
  openReplies[tweetId] = !openReplies[tweetId];
  saveAndRender();
}

function handleTweetBtnClick() {
  const tweetInput = document.getElementById("tweet-input");
  if (tweetInput.value) {
    tweetsData.unshift({
      handle: "@Cosminrotaru",
      profilePic: "images/profil.jpeg",
      likes: 0,
      retweets: 0,
      tweetText: tweetInput.value,
      replies: [],
      isLiked: false,
      isRetweeted: false,
      uuid: uuidv4(),
      userTweet: true,
    });
    tweetInput.value = "";
    saveAndRender();
  }
}

function handleDeleteClick(tweetId) {
  tweetsData = tweetsData.filter(
    (tweet) => !(tweet.uuid === tweetId && tweet.userTweet)
  );
  saveAndRender();
}

function handleAddReplyClick(tweetId) {
  const replyInput = document.getElementById(`reply-input-${tweetId}`);
  if (replyInput.value) {
    for (let tweet of tweetsData) {
      if (tweet.uuid === tweetId) {
        tweet.replies.push({
          handle: "@Cosminrotaru",
          profilePic: "images/profil.jpeg",
          tweetText: replyInput.value,
          userReply: true,
          replyId: uuidv4(),
        });
        openReplies[tweetId] = true;
        break;
      }
    }
    replyInput.value = "";
    saveAndRender();
  }
}

function handleDeleteReplyClick(replyId) {
  for (let tweet of tweetsData) {
    tweet.replies = tweet.replies.filter(
      (reply) => !(reply.replyId === replyId && reply.userReply)
    );
  }
  saveAndRender();
}

function saveAndRender() {
  localStorage.setItem("tweetsData", JSON.stringify(tweetsData));
  render();
}

function getFeedHtml() {
  let feedHtml = "";
  for (let tweet of tweetsData) {
    let likeClass = tweet.isLiked ? "liked" : "";
    let retweetClass = tweet.isRetweeted ? "retweeted" : "";
    let repliesHtml = "";
    for (let reply of tweet.replies) {
      repliesHtml += `
        <div class="tweet-reply">
          <div class="tweet-inner">
            <img src="${reply.profilePic}" class="profile-pic">
            <div>
              <p class="handle">${reply.handle}</p>
              <p class="tweet-text">${reply.tweetText}</p>
              ${
                reply.userReply
                  ? `<i class="fa-solid fa-trash-can" data-deletereply="${reply.replyId}"></i>`
                  : ""
              }
            </div>
          </div>
        </div>`;
    }
    let isOpen = openReplies[tweet.uuid] ? "" : "hidden";
    feedHtml += `
      <div class="tweet">
        <div class="tweet-inner">
          <img src="${tweet.profilePic}" class="profile-pic">
          <div>
            <p class="handle">${tweet.handle}</p>
            <p class="tweet-text">${tweet.tweetText}</p>
            <div class="tweet-details">
              <span class="tweet-detail">
                <i class="fa-regular fa-comment-dots" data-reply="${
                  tweet.uuid
                }"></i>
                ${tweet.replies.length}
              </span>
              <span class="tweet-detail">
                <i class="fa-solid fa-heart ${likeClass}" data-like="${
      tweet.uuid
    }"></i>
                ${tweet.likes}
              </span>
              <span class="tweet-detail">
                <i class="fa-solid fa-retweet ${retweetClass}" data-retweet="${
      tweet.uuid
    }"></i>
                ${tweet.retweets}
              </span>
              ${
                tweet.userTweet
                  ? `<i class="fa-solid fa-trash-can" data-delete="${tweet.uuid}"></i>`
                  : ""
              }
            </div>
            <div class="${isOpen}" id="reply-box-${tweet.uuid}">
              <input type="text" id="reply-input-${
                tweet.uuid
              }" class="reply-input" placeholder="Add a reply...">
              <button data-addreply="${tweet.uuid}">Reply</button>
            </div>
          </div>
        </div>
        <div class="${isOpen}" id="replies-${tweet.uuid}">
          ${repliesHtml}
        </div>
      </div>`;
  }
  return feedHtml;
}

function render() {
  document.getElementById("feed").innerHTML = getFeedHtml();
}

render();
