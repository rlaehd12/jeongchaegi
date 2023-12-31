import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Nav from "../../components/Nav";
import style from "../../styles/MyPage.module.css";
import MyPageScrap from "../../components/MyPageScrap";
import Link from "next/link";
import OurAxios from "../../config/ourAxios";
import { useSelector } from "react-redux";

export default function Page() {
  // 변수
  const router = useRouter();
  const api = OurAxios();
  const myStatus = ["스크랩수", "작성글", "팔로우", "팔로워"];
  const userData = useSelector((state) => state.user);

  // state
  const [userImg, setUserImg] = useState("");
  const [userName, setUserName] = useState("");
  const [myScrapCnt, setMyScrapCnt] = useState(0);
  const [myArticleCnt, setMyArticleCnt] = useState(0);
  const [myFollowCnt, setMyFollowCnt] = useState(0);
  const [myFollowerCnt, setMyFollowerCnt] = useState(0);

  async function getUserData() {
    const userId = localStorage.getItem("userID");
    setUserImg(localStorage.getItem("userImg"));
    setUserName(localStorage.getItem("userName"));
    api.get(`/scraps/count/members/${userId}`).then((res) => {
      setMyScrapCnt(res.data);
    });
  }

  useEffect(() => {
    if (!userData.isLogined) {
      alert("로그인이 필요한 페이지입니다.");
      router.push("/login");
      return;
    } else {
      getUserData();
      //api.get(`/posts/my?pageIndex=1`)
      //.then((res)=>setMyArticleCnt(res.data.totalElements))
      const userId = localStorage.getItem("userID");
      api
        .get(`members/followInfo`, { params: { memberid: userId } })
        .then((res) => {
          setMyArticleCnt(res.data.post);
          setMyFollowCnt(res.data.followee);
          setMyFollowerCnt(res.data.follower);
        });
    }
  }, []);

  // 팔로우, 팔로워 페이지 이동
  function handleStatusCard(item) {
    switch (item) {
      case "스크랩수":
        return (
          <Link href={`/myscrap/${userName}`}>
            <a className="hover:bg-gray-400 hover:cursor-pointer transition-all duration-300">
              <div className={style.status_card}>
                <div className={style.status_card_header}>{item}</div>
                <div className={style.status_card_content}>{myScrapCnt}</div>
              </div>
            </a>
          </Link>
        );
      case "팔로우":
        return (
          <Link href={`/follow/${localStorage.getItem("userID")}`}>
            <a className="hover:bg-gray-400 hover:cursor-pointer transition-all duration-300">
              <div className={style.status_card}>
                <div className={style.status_card_header}>{item}</div>
                <div className={style.status_card_content}>{myFollowCnt}</div>
              </div>
            </a>
          </Link>
        );
      case "팔로워":
        return (
          <Link href={`/follower/${localStorage.getItem("userID")}`}>
            <a className="hover:bg-gray-400 hover:cursor-pointer transition-all duration-300">
              <div className={style.status_card}>
                <div className={style.status_card_header}>{item}</div>
                <div className={style.status_card_content}>{myFollowerCnt}</div>
              </div>
            </a>
          </Link>
        );
      case "작성글":
        return (
          <Link href={`/myarticle/${localStorage.getItem("userID")}`}>
            <a className="hover:bg-gray-400 hover:cursor-pointer transition-all duration-300">
              <div className={style.status_card}>
                <div className={style.status_card_header}>{item}</div>
                <div className={style.status_card_content}>{myArticleCnt}</div>
              </div>
            </a>
          </Link>
        );
      default:
        return (
          <div className={style.status_card}>
            <div className={style.status_card_header}>{item}</div>
            <div className={style.status_card_content}>0</div>
          </div>
        );
    }
  }
  // 팔로우, 팔로워 페이지 이동

  return (
    <>
      {userData.isLogined ? (
        <div className={style.all_wrapper}>
          <Nav />
          <div className={style.content_wrapper}>
            <div className={style.profile_wrapper}>
              <div className={style.profile_box}>
                <div className={style.profile_picture}>
                  <img
                    className="rounded-full"
                    src={userImg}
                    width="200px"
                    height="200px"
                  />
                </div>
                <div className={style.profile_name}>{userName}</div>
              </div>
              <div className={style.status_box}>
                <div className={style.status_header}>
                  <label>My Status</label>
                </div>
                {/* 팔로우, 팔로워 페이지 이동 */}
                <div className={style.status_content}>
                  {myStatus.map((item) => (
                    <React.Fragment key={item}>
                      {handleStatusCard(item)}
                    </React.Fragment>
                  ))}
                </div>
                {/* 팔로우, 팔로워 페이지 이동 */}
                <div className={style.stastus_footer}>
                  <button
                    className={style.status_footer_button}
                    onClick={() => {
                      router.push(`/mypage/${userName}/edit`);
                    }}
                  >
                    프로필 수정
                  </button>
                </div>
              </div>
            </div>
            <div className={style.policyList_wrapper}>
              <div className={style.policyList_header}>
                <div>My Scrap</div>
              </div>
              <div className={style.policyList_content}>
                <MyPageScrap />
              </div>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
    </>
  );
}
