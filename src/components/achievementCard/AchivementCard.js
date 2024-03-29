import React from "react";
import "./AchievementCard.css";

export default function AchivementCard({ cardInfo }) {
  function openUrlInNewTab(url) {
    var win = window.open(url, "_blank");
    win.focus();
  }


  const GetDescBullets = ({ descBullets }) => {
    return descBullets ? descBullets.map((item) => <li className="subTitle">{item}</li>) : null
  };

  return (

      <div className="certificate-card">
        <div className="certificate-image-div">
          <img src={cardInfo.image} alt="PWA" className="card-image"></img>
        </div>
        <div className="certificate-detail-div">
          <h5 className="card-title">{cardInfo.title}</h5>
          <p className="card-subtitle">{cardInfo.description}</p>
        </div>
        <ul>
          <GetDescBullets descBullets={cardInfo.descBullets} />
        </ul>
        <div className="certificate-card-footer">
          {cardInfo.footer.map((v, i) => {
            return <span class="certificate-tag" onClick={() => openUrlInNewTab(v.url)}>{v.name}</span>;
          })}
        </div>
      </div>
  );
}
