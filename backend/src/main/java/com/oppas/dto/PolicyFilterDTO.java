package com.oppas.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PolicyFilterDTO {
    private Integer type; // 정책 구분 코드
    private Integer region; // 지역 코드
    private Integer age; // 나이
    private String keyword; // 검색 키워드
    private LocalDate date; // 날짜
}
