import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import style from "../styles/PolicyList.module.css";
import Nav from "../components/Nav";
import PcyListItem from "../components/PcyListItem";
import PolicyListSearch, {
  mySearchQuery,
} from "../components/PolicyListSearch";
import PolicyFilter, {
  searchAge,
  selectPcyTypes,
} from "../components/PolicyFilter";
import PolicyListCalendar from "../components/PolicyListCalendar";
import PolicyListSort from "../components/PolicyListSort";

import { sido } from "../components/SelectPlace"; // 컴포넌트 변수 가져옴
import OurAxios from "../config/ourAxios";

// import "../node_modules/bootstrap/dist/css/bootstrap.min.css";  // 이제 머 삭제해서 전역 아니여도 적용 가능함, 문제 생길수도?

import axios from "axios";
import Spin from "../components/Spin";

let page = 1;
let lastPage = 999999999999;

export default function PolicyList() {
  const router = useRouter();
  const { calendarActive, date } = router.query;

  // State 모음
  const [isCalendarActive, setIsCalendarActive] = useState(
    Boolean(calendarActive)
  );

  const [pcydata, setpcy] = useState(null); // 정책리스트 데이터, 수정잦음
  const [targetDate, setTargetDate] = useState(null); // 날짜 데이터 상태관리
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isFirstLoadingList, setIsFirstLoadingList] = useState(true);

  // useEffect 관리 모음
  useEffect(() => {
    page = 1;
    lastPage = 9999999;
    setpcy([]);
    setTargetDate(null)

    getPcyData(page, router.query);
  }, [router.query]); // url 쿼리 바뀔 시 실행,

  useEffect(() => {
    // 컴포넌트 생성시 할것들

    if (date) {
      setTargetDate(new Date(date));
    }
    page = 1;
    lastPage = 9999999;
  }, []);

  useEffect(() => {
    // 스크롤 이벤트는 처음 했던거 기준으로만 됨 그래서 계속 함수 최신화 할거임 근데 계속 함수 생성하니까 문제, 어떻게 하지?
    const timer = setInterval(() => {
      window.addEventListener("scroll", handleScroll);
    }, 100);
    return () => {
      // 컴포넌트 생성시 스크롤 이벤트, 끝날때 없애기
      clearInterval(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  // 검색 클릭시 filter 항목 ================현재 수정중!!!!!!!!!!!!!!!!!!!!!!!!!!!
  function submitParamsToBack() {
    function getToday() {
      // 긁어온 yyyy-mm-dd형식으로 바꿔주는 함수
      if (targetDate) {
        var year = targetDate.getFullYear();
        var month = ("0" + (1 + targetDate.getMonth())).slice(-2);
        var day = ("0" + targetDate.getDate()).slice(-2);

        return year + "-" + month + "-" + day;
      }
      return null;
    }

    const types = selectPcyTypes.join(",");
    const region = sido;
    const age = searchAge;
    const keyword = mySearchQuery;
    const date = getToday();

    const paramobj = { types, region, age, keyword, date };
    for (const key in paramobj) {
      // 없으면 한번 처리
      if (!paramobj[key]) {
        delete paramobj[key];
      }
    }

    router.replace({
      // url 변경함 그리고 가져올거임
      pathname: "/policylist",
      query: paramobj,
    });
  }

  // policy data 서버에서 받기, 나중에 수정 예정
  function getPcyData(page, paramobj = "") {
    setIsLoadingList((isLoadingList) => !isLoadingList);
    axios({
      method: "get",
      url: "http://3.36.131.236/api/policies",
      params: {
        ...paramobj,
        pageIndex: page,
      },
    })
      .then((res) => {
        if (!pcydata) {
          lastPage = res.data.totalPages; // 그래도 처음꺼 더 바꾸기 귀찮아서 내버려 둠
          setpcy([...res.data.content]);
        } else {
          lastPage = res.data.totalPages;
          setpcy((pcydata) => [...pcydata, ...res.data.content]);
        }
      })
      .finally(() => {
        setIsLoadingList((isLoadingList) => !isLoadingList);
        setIsFirstLoadingList(false);
      });
  }

  // 스크롤 이벤트 감시
  function handleScroll() {
    const { scrollHeight, scrollTop, clientHeight } = document.documentElement; // 2
    if (
      !isLoadingList &&
      Math.abs(scrollHeight - clientHeight - scrollTop) < 1
    ) {
      page += 1;
      if (page <= lastPage) getPcyData(page, router.query);
    }
  }

  function handleItemClick(itemId) {
    router.push({
      pathname: `/policydetail/${itemId}`,
      query: { itemId: itemId },
    });
    // Do whatever you want with the clicked item ID
  }

  function calendarBtnClick() {
    setIsCalendarActive((prev) => !prev);
  }

  function onClickDay(e) {
    if (targetDate) {
      // 날짜가 입력되어 있는 경우
      if (
        targetDate.getFullYear() == e.getFullYear() &&
        targetDate.getMonth() == e.getMonth() &&
        targetDate.getDate() == e.getDate()
      ) {
        setTargetDate(null); // 같은 날짜 클릭하는 경우
      } else {
        setTargetDate(new Date(e.getFullYear(), e.getMonth(), e.getDate())); // 다른날짜 클릭
      }
    } else setTargetDate(new Date(e.getFullYear(), e.getMonth(), e.getDate())); // 날짜 없으면
  }

  return (
    <div className={style.wrapper}>
      {/* navbar */}
      <Nav />
      {/* fixed calendar */}
      {isCalendarActive ? (
        <div className={`${style.calendar_wrap}`}>
          <div className={style.calendar_wrap_header}>날짜 고르고 적용 Click!</div>
          {isCalendarActive === true ? (
            <PolicyListCalendar
              onClickDay={onClickDay}
              targetDate={targetDate}
            />
          ) : null}
        </div>
      ) : null}

      {/* 바깥쪽 랩 */}
      <div
        className={`${style.list_wrap_container}
          ${isCalendarActive ? style.list_wrap_on : style.list_wrap_off}`}
      >
        {/* 필터 */}
        <div>
          <PolicyFilter
            isCalendarActive={isCalendarActive}
            calendarBtnClick={calendarBtnClick}
          />
          {/* 검색창 */}
          <PolicyListSearch submitParamsToBack={submitParamsToBack} />
        </div>

        {/* 정렬 기능 */}
        {/* <PolicyListSort /> */}

        {/* pcylist */}
        <div className={isFirstLoadingList ? style.loading : style.pcylist}>
          <PcyListItem obj={pcydata} onItemClick={handleItemClick} />
          {isFirstLoadingList ? (<Spin />) : ""}
        </div>
        <span className={style.loading}>
          {!isFirstLoadingList && isLoadingList ? (<Spin />) : ""}
        </span>
        <span className={`${style.loading} font-bold`}>
          {lastPage <= page ? '마지막 페이지 입니다.' : false}
        </span>
      </div>
    </div>
  );
}
