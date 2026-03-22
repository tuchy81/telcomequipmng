# 네트워크 전산장비 실사점검 시스템 — MVP 개발명세서

> 작성일: 2026-03-22 | 버전: v1.3 | HD현대 시스템아키텍처팀

---

## 1. 개요

관리자가 **실사번호를 생성·관리**하고, 작업자가 **웹(PC/모바일)에서 해당 실사번호 기준으로 점검 내역을 등록·수정**하는 시스템.  
관리자가 실사를 **완료 처리**하면 해당 실사번호의 모든 점검 내역은 **등록·수정·삭제 불가** 상태로 잠금.  
등록된 사진에 GPS EXIF 정보가 있을 경우에만 지도에서 위치 확인 가능.

- 인증/권한 없음 (내부망 단순 접근, 이름 직접 입력)
- 단일 서버, 단일 DB
- 웹(React PWA) 단일 앱 — PC·모바일 반응형

---

## 2. 사용자 및 역할

| 역할 | 접근 | 주요 권한 |
|------|------|-----------|
| 관리자 | PC 웹 | 실사번호 등록·완료처리, 자산 관리, 전체 점검 조회, 지도 확인 |
| 작업자 | PC/모바일 웹 | 실사번호 선택 → 점검 등록·수정·삭제 (완료 전까지), 이전 실사 내역 조회 |

---

## 3. 기능 명세

### 3-1. 관리자 화면

**실사 관리**
- 실사번호 등록 — 실사명, 실사기간(시작일~종료일), 대상 범위(메모) 입력
- 실사 목록 조회 — 진행중 / 완료 구분 표시
- **실사 완료 처리** — 완료 버튼 클릭 시 확인 팝업 → 완료 처리
  - 완료된 실사번호의 모든 점검 내역은 등록·수정·삭제 비활성화
  - 완료 취소(재오픈) 기능 포함
- 실사 삭제 — 점검 내역 없는 경우에만 허용

**자산 관리**
- 자산 목록 조회, 등록, 수정, 삭제
- Excel 다운로드

**대시보드**
- 진행중 실사 수, 전체 장비 수, 금일 점검 수, 이상 장비 수

**점검 위치 지도**
- 실사번호별 또는 전체 점검 중 사진 EXIF GPS 좌표가 있는 건만 마커 표시
- 마커 색상 — 정상: 초록 / 이상: 빨강 / 보류: 주황
- 마커 클릭 시 팝업 — 자산번호, 장비명, 작업자, 점검일시, 결과, 사진 썸네일

### 3-2. 작업자 화면 (웹 — PC/모바일 반응형)

**실사번호 선택**
- 진행중인 실사번호 목록 표시 (완료된 실사는 선택 불가)
- 실사명, 기간 표시

**점검 내역 목록**
- 선택한 실사번호에 속한 내 점검 내역 목록
- 각 항목에 수정 / 삭제 버튼 (실사 완료 시 비활성)
- **이전 실사 내역 보기** — 동일 자산의 직전 실사 결과를 접이식 패널로 표시 (사진 포함)

**점검 등록 / 수정**
- 실사번호 (자동, 선택된 실사번호 고정 표시)
- 자산 검색 — 자산번호 또는 장비명 입력 후 선택
- 이전 실사 내역 미리보기 패널 (동일 자산의 가장 최근 점검 결과 자동 표시)
- 점검 결과 선택 — 정상 / 이상 / 보류
- 메모 입력 — 자유 텍스트 200자
- 사진 첨부 — 카메라 촬영 또는 파일 선택, 최대 5장
- 저장 / 취소

**점검 삭제**
- 해당 점검 건 삭제 (실사 완료 시 불가)

> 실사 완료된 건 — 모든 입력 필드 비활성화, "완료된 실사입니다" 안내 표시

---

## 4. 잠금 처리 규칙

| 조건 | 등록 | 수정 | 삭제 |
|------|------|------|------|
| 실사 진행중 | ✅ 허용 | ✅ 허용 | ✅ 허용 |
| 실사 완료 처리됨 | ❌ 불가 | ❌ 불가 | ❌ 불가 |

- 잠금 기준 — `TB_SURVEY.status = 'CLOSED'`
- API 레벨에서도 체크 — 완료된 실사번호로 POST/PUT/DELETE 요청 시 `403 Forbidden` 반환
- 프론트에서도 UI 비활성화 처리 (이중 방어)

---

## 5. 데이터 모델

### TB_SURVEY (실사 마스터) ← 신규

| 컬럼 | 타입 | 설명 |
|------|------|------|
| survey_id | BIGINT PK | 자동증가 |
| survey_no | VARCHAR(30) | 실사번호 (고유, 관리자 입력) |
| survey_name | VARCHAR(100) | 실사명 |
| start_date | DATE | 실사 시작일 |
| end_date | DATE | 실사 종료일 |
| description | TEXT | 대상 범위 메모 |
| status | VARCHAR(10) | 상태 (OPEN / CLOSED) |
| closed_at | TIMESTAMP | 완료 처리 일시 |
| closed_by | VARCHAR(50) | 완료 처리자 |
| created_at | TIMESTAMP | 등록일시 |

### TB_ASSET (자산 마스터)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| asset_id | BIGINT PK | 자동증가 |
| asset_no | VARCHAR(30) | 자산번호 (고유) |
| asset_name | VARCHAR(100) | 장비명 |
| category | VARCHAR(20) | 분류 (스위치/서버/AP 등) |
| location_building | VARCHAR(50) | 건물 |
| location_floor | VARCHAR(10) | 층 |
| location_room | VARCHAR(50) | 실/공간 |
| rack_position | VARCHAR(30) | 랙 위치 |
| ip_address | VARCHAR(40) | 관리 IP |
| serial_no | VARCHAR(60) | 시리얼번호 |
| status | VARCHAR(10) | 운영상태 (운영중/폐기/보관) |
| created_at | TIMESTAMP | 등록일시 |
| updated_at | TIMESTAMP | 수정일시 |

### TB_INSPECTION (점검 결과)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| inspection_id | BIGINT PK | 자동증가 |
| **survey_id** | **BIGINT FK** | **실사 참조 (TB_SURVEY)** |
| asset_id | BIGINT FK | 자산 참조 |
| inspect_dt | TIMESTAMP | 점검 일시 |
| inspector_name | VARCHAR(50) | 작업자 이름 (직접 입력) |
| result | VARCHAR(10) | 결과 (정상/이상/보류) |
| field_memo | TEXT | 점검 메모 |
| admin_memo | TEXT | 관리자 보완 내용 |
| created_at | TIMESTAMP | 최초 등록일시 |
| updated_at | TIMESTAMP | 최종 수정일시 |

> GPS 좌표는 점검 레코드에서 제거 — 사진 EXIF에서 추출하여 TB_INSPECTION_FILE에 저장

### TB_INSPECTION_FILE (첨부 사진)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| file_id | BIGINT PK | 자동증가 |
| inspection_id | BIGINT FK | 점검 결과 참조 |
| file_path | VARCHAR(300) | 서버 저장 경로 |
| file_name | VARCHAR(100) | 원본 파일명 |
| file_size | BIGINT | 파일 크기 (bytes) |
| **exif_lat** | **NUMERIC(10,7)** | **사진 EXIF 위도 (없으면 NULL)** |
| **exif_lng** | **NUMERIC(10,7)** | **사진 EXIF 경도 (없으면 NULL)** |
| **exif_taken_at** | **TIMESTAMP** | **사진 촬영 일시 (EXIF)** |
| created_at | TIMESTAMP | 업로드 일시 |

---

## 6. 사진 EXIF GPS 추출

사진 업로드 시 서버에서 EXIF 메타데이터를 파싱하여 GPS 좌표를 추출.  
좌표가 없는 사진은 exif_lat/lng = NULL 저장, 지도에서 제외.

```java
// Spring Boot — Apache Commons Imaging 또는 metadata-extractor 라이브러리 사용
// build.gradle
implementation 'com.drewnoakes:metadata-extractor:2.19.0'

// 업로드 처리 시
Metadata metadata = ImageMetadataReader.readMetadata(inputStream);
GpsDirectory gpsDir = metadata.getFirstDirectoryOfType(GpsDirectory.class);
if (gpsDir != null && gpsDir.getGeoLocation() != null) {
    double lat = gpsDir.getGeoLocation().getLatitude();
    double lng = gpsDir.getGeoLocation().getLongitude();
    // file.setExifLat(lat); file.setExifLng(lng);
}
```

> ⚠️ 스마트폰 카메라로 촬영한 사진은 대부분 GPS EXIF 포함.  
> 갤러리에서 선택한 사진은 EXIF가 제거된 경우 있음 (지도 제외 처리).

---

## 7. 지도 기능 상세

### 사용 라이브러리

| 항목 | 내용 |
|------|------|
| 지도 | **Leaflet.js + OpenStreetMap** (API 키 불필요, 무료) |
| React 래퍼 | `react-leaflet` |

### 데이터 흐름

```
사진 업로드 → 서버에서 EXIF GPS 추출 → TB_INSPECTION_FILE.exif_lat/lng 저장
                                              ↓
관리자 지도 화면 → /api/inspections/map 호출 → exif_lat/lng NOT NULL인 사진 기준 마커 표시
```

### 지도용 API

| Method | URL | 설명 |
|--------|-----|------|
| GET | /api/inspections/map | EXIF GPS 있는 사진 기준 점검 마커 목록 반환 |

```
쿼리 파라미터:
  survey_id   : 실사번호 필터 (선택)
  result      : 정상/이상/보류 (선택)

응답 필드:
  inspection_id, asset_no, asset_name,
  inspect_dt, inspector_name, result,
  exif_lat, exif_lng, thumbnail_url
  (사진 1장 기준 — exif 있는 첫 번째 사진)
```

---

## 8. API 목록

### 실사(Survey) API

| Method | URL | 설명 |
|--------|-----|------|
| GET | /api/surveys | 실사 목록 조회 |
| POST | /api/surveys | 실사 등록 |
| PUT | /api/surveys/{id} | 실사 수정 |
| POST | /api/surveys/{id}/close | **실사 완료 처리 (잠금)** |
| POST | /api/surveys/{id}/reopen | 완료 취소 (재오픈) |
| DELETE | /api/surveys/{id} | 실사 삭제 (점검 없는 경우만) |

### 자산(Asset) API

| Method | URL | 설명 |
|--------|-----|------|
| GET | /api/assets | 자산 목록 조회 |
| POST | /api/assets | 자산 등록 |
| PUT | /api/assets/{id} | 자산 수정 |
| DELETE | /api/assets/{id} | 자산 삭제 |

### 점검(Inspection) API

| Method | URL | 설명 |
|--------|-----|------|
| GET | /api/surveys/{surveyId}/inspections | 실사별 점검 목록 |
| GET | /api/inspections/{id} | 점검 상세 |
| GET | /api/assets/{assetId}/inspections/latest | **자산의 직전 실사 내역 조회** |
| POST | /api/surveys/{surveyId}/inspections | 점검 등록 (CLOSED 시 403) |
| PUT | /api/inspections/{id} | 점검 수정 (CLOSED 시 403) |
| DELETE | /api/inspections/{id} | 점검 삭제 (CLOSED 시 403) |
| POST | /api/inspections/{id}/files | 사진 업로드 (EXIF 자동 추출) |
| DELETE | /api/inspections/{id}/files/{fileId} | 사진 삭제 (CLOSED 시 403) |
| GET | /api/inspections/map | 지도용 GPS 점검 목록 |

---

## 9. 업무 흐름

```
[관리자] 실사번호 등록 (survey_no, 기간 입력) → status = OPEN
      ↓
[작업자-웹] 진행중 실사번호 선택
      → 자산 검색 → 이전 실사 내역 자동 표시
      → 점검 결과 입력 + 사진 첨부
      → 저장 (등록) / 목록에서 수정·삭제 가능
      ↓
[관리자] 점검 내역 확인 → 관리자 메모 보완
      ↓
[관리자] 실사 완료 처리 → status = CLOSED → 모든 점검 내역 잠금
      ↓
[관리자] 지도 탭에서 EXIF GPS 있는 사진 위치 확인
```

---

## 10. 기술 스택

| 구분 | 기술 | 비고 |
|------|------|------|
| 프론트엔드 | React + Vite (반응형 PWA) | PC·모바일 단일 앱 |
| 지도 | Leaflet.js + OpenStreetMap | API 키 불필요 |
| 백엔드 | Spring Boot 3 + JPA | REST API |
| EXIF 파싱 | metadata-extractor 라이브러리 | 사진 GPS 추출 |
| DB | SQLite | Docker Volume 마운트로 영속화 |
| 파일 저장 | Docker Volume | 컨테이너 외부 볼륨 마운트 |
| 배포 | Docker Compose | 단일 서버, 단일 컨테이너 |

---

## 11. 개발 일정

| 주차 | 작업 내용 |
|------|-----------|
| 1주 | DB 설계 확정 (TB_SURVEY 포함), 프로젝트 세팅 |
| 2주 | 실사 CRUD API + 완료처리/잠금 로직, 자산 CRUD API |
| 3주 | 점검 API + 사진 업로드 + EXIF GPS 추출 |
| 4주 | 작업자 화면 — 실사 선택, 점검 등록·수정, 이전 실사 내역 패널 |
| 5주 | 관리자 화면 — 실사 관리, 대시보드, Leaflet 지도 |
| 6주 | 통합 테스트, 버그 수정, 배포 |

> 총 **6주**, 개발자 2명 기준

---

## 12. MVP 제외 항목 (이후 단계)

- QR/바코드 스캔
- 오프라인 동기화
- 인증/권한 (Keycloak RBAC)
- Excel Import
- PDF 보고서
- MinIO 파일 스토리지
- 지도 마커 클러스터링
