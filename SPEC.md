# 네트워크 전산장비 실사점검 시스템 — 개발 상세 명세서

> 작성일: 2026-03-23 | 프로젝트: telcomequipmng | 본 문서는 실제 구현 코드 기반의 권위 있는 기술 명세서입니다.

---

## 1. 프로젝트 개요

### 1-1. 시스템 목적

네트워크 전산장비(스위치, 서버, AP 등)에 대한 **실사점검 업무를 디지털화**하는 웹 애플리케이션이다. 관리자가 실사번호를 생성하고, 작업자가 해당 실사번호 기준으로 장비 점검 내역을 등록/수정/삭제한다. 실사가 완료 처리되면 모든 점검 데이터는 변경 불가 상태로 잠금된다. 점검 시 촬영된 사진에서 EXIF GPS 좌표를 추출하여 지도에서 점검 위치를 시각적으로 확인할 수 있다.

### 1-2. 핵심 특징

- 인증/권한 체계 없음 (내부망 단순 접근, 작업자 이름 직접 입력)
- 관리자 접근은 단일 비밀번호(BCrypt) 기반 검증
- 단일 서버, 단일 SQLite DB
- React PWA 단일 앱 — PC/모바일 반응형

### 1-3. 사용자 역할

| 역할 | 접근 방식 | 주요 권한 |
|------|-----------|-----------|
| **관리자** | PC 웹 (비밀번호 인증) | 실사번호 등록/완료처리/재오픈, 자산 CRUD, 전체 점검 조회, 대시보드, 지도 확인, 비밀번호 변경 |
| **작업자** | PC/모바일 웹 (인증 없음) | 진행중 실사번호 선택, 점검 등록/수정/삭제 (완료 전까지), 이전 실사 내역 조회 |

---

## 2. 기술 스택 상세

### 2-1. 프론트엔드

| 항목 | 기술/버전 | 비고 |
|------|-----------|------|
| UI 프레임워크 | React `^18.3.1` | `react-dom ^18.3.1` |
| 라우팅 | react-router-dom `^6.23.1` | BrowserRouter 기반 |
| HTTP 클라이언트 | axios `^1.7.2` | API 통신 |
| 지도 | Leaflet `^1.9.4` + react-leaflet `^4.2.1` | OpenStreetMap 타일 (API 키 불필요) |
| 빌드 도구 | Vite `^5.3.4` | `@vitejs/plugin-react ^4.3.1` |
| 언어 | TypeScript `^5.5.3` | strict 모드 |
| 타입 정의 | `@types/react ^18.3.3`, `@types/react-dom ^18.3.0`, `@types/leaflet ^1.9.12` | |
| 패키지명 | `telcom-equip-inspection` | `"type": "module"` |
| 프로덕션 서빙 | nginx:alpine | SPA fallback + API 리버스 프록시 |

### 2-2. 백엔드

| 항목 | 기술/버전 | 비고 |
|------|-----------|------|
| 프레임워크 | Spring Boot `3.4.3` | `io.spring.dependency-management 1.1.7` |
| 언어 | Java `21` (toolchain) | |
| 데이터 액세스 | Spring Data JPA | `spring-boot-starter-data-jpa` |
| 검증 | Jakarta Validation | `spring-boot-starter-validation` |
| DB 드라이버 | SQLite JDBC `3.45.3.0` | `org.xerial:sqlite-jdbc` |
| DB 방언 | Hibernate Community Dialects `6.6.4.Final` | `SQLiteDialect` |
| EXIF 파싱 | metadata-extractor `2.19.0` | `com.drewnoakes:metadata-extractor` |
| Excel 내보내기 | Apache POI `5.2.5` | `poi-ooxml` (XLSX 형식) |
| 암호 해싱 | Spring Security Crypto | `BCryptPasswordEncoder` (spring-security-crypto) |
| API 문서 | springdoc-openapi `2.8.4` | Swagger UI (`/swagger-ui.html`), OpenAPI 3.0 JSON (`/v3/api-docs`) |
| JSON 직렬화 | Jackson (SNAKE_CASE 전략) | `spring.jackson.property-naming-strategy=SNAKE_CASE` |
| 그룹/아티팩트 | `com.telcom` / `equip` | 버전 `0.0.1-SNAPSHOT` |

### 2-3. 데이터베이스

| 항목 | 내용 |
|------|------|
| DBMS | SQLite |
| 파일 경로 | `${DB_PATH:./data/telcom.db}` |
| DDL 전략 | `hibernate.ddl-auto: update` (자동 스키마 갱신) |
| 영속화 | Docker Volume `db-data` → `/app/data` |

### 2-4. 빌드 및 배포

| 항목 | 내용 |
|------|------|
| 백엔드 빌드 | Gradle Kotlin DSL (`build.gradle.kts`) |
| 프론트엔드 빌드 | `tsc && vite build` |
| 컨테이너화 | Docker + Docker Compose |
| 백엔드 베이스 이미지 | `eclipse-temurin:21-jdk` (빌드) → `eclipse-temurin:21-jre` (런타임) |
| 프론트엔드 베이스 이미지 | `node:20-alpine` (빌드) → `nginx:alpine` (런타임) |

---

## 3. 프로젝트 구조

```
telcomequipmng/
├── docker-compose.yml                          # Docker Compose 오케스트레이션
├── README.md                                   # MVP 개발명세서
├── SPEC.md                                     # 본 상세 기술 명세서
│
├── backend/
│   ├── Dockerfile                              # 멀티스테이지 빌드 (JDK→JRE)
│   ├── build.gradle.kts                        # Gradle 빌드 설정
│   ├── settings.gradle.kts
│   ├── gradlew / gradle/
│   └── src/main/
│       ├── resources/
│       │   └── application.yml                 # Spring Boot 설정
│       └── java/com/telcom/equip/
│           ├── TelcomEquipApplication.java     # 메인 클래스, BCrypt 빈, 초기 비밀번호 설정
│           ├── entity/
│           │   ├── Survey.java                 # TB_SURVEY 엔티티
│           │   ├── Asset.java                  # TB_ASSET 엔티티
│           │   ├── Inspection.java             # TB_INSPECTION 엔티티
│           │   ├── InspectionFile.java         # TB_INSPECTION_FILE 엔티티
│           │   └── AdminSetting.java           # TB_ADMIN_SETTING 엔티티
│           ├── repository/
│           │   ├── SurveyRepository.java
│           │   ├── AssetRepository.java
│           │   ├── InspectionRepository.java
│           │   ├── InspectionFileRepository.java
│           │   └── AdminSettingRepository.java
│           ├── dto/
│           │   ├── SurveyRequest.java          # record
│           │   ├── SurveyResponse.java         # record
│           │   ├── AssetRequest.java           # record
│           │   ├── AssetResponse.java          # record
│           │   ├── InspectionRequest.java      # record
│           │   ├── InspectionResponse.java     # record (내부 FileInfo record 포함)
│           │   ├── MapMarkerResponse.java      # record
│           │   ├── AdminPasswordRequest.java   # record
│           │   └── DashboardResponse.java      # record
│           ├── service/
│           │   ├── SurveyService.java
│           │   ├── AssetService.java
│           │   ├── InspectionService.java      # SurveyClosedException 내부 클래스 포함
│           │   ├── FileStorageService.java     # EXIF 파싱 + 파일 저장/삭제
│           │   └── AdminService.java           # BCrypt 검증/변경, 대시보드
│           └── config/
│               ├── WebConfig.java              # CORS 설정, 파일 리소스 핸들러
│               └── GlobalExceptionHandler.java # 전역 예외 처리
│
└── frontend/
    ├── Dockerfile                              # 멀티스테이지 빌드 (Node→Nginx)
    ├── package.json
    ├── nginx.conf                              # API 리버스 프록시 + SPA fallback
    └── src/
        ├── App.tsx                             # 라우팅 정의
        ├── App.css
        ├── types/
        │   └── index.ts                        # TypeScript 인터페이스 정의
        ├── api/
        │   └── client.ts                       # Axios API 클라이언트 함수
        ├── hooks/
        │   └── useAdminAuth.ts                 # 관리자 인증 상태 훅
        ├── components/
        │   ├── Layout.tsx                      # 공통 레이아웃
        │   ├── AdminLayout.tsx                 # 관리자 레이아웃 (인증 게이트)
        │   ├── AdminPasswordDialog.tsx         # 비밀번호 입력 모달
        │   ├── Loading.tsx                     # 로딩 컴포넌트
        │   └── ConfirmDialog.tsx               # 확인 다이얼로그
        └── pages/
            ├── HomePage.tsx                    # 홈 (역할 선택)
            ├── admin/
            │   ├── Dashboard.tsx               # 대시보드
            │   ├── SurveyManagement.tsx        # 실사 관리
            │   ├── AssetManagement.tsx          # 자산 관리
            │   ├── InspectionList.tsx           # 점검 목록 (관리자)
            │   ├── MapView.tsx                  # 지도 뷰
            │   └── Settings.tsx                 # 설정 (비밀번호 변경)
            └── worker/
                ├── SurveySelect.tsx             # 실사번호 선택
                ├── InspectionList.tsx            # 점검 목록 (작업자)
                ├── InspectionForm.tsx            # 점검 등록/수정 폼
                └── InspectionDetail.tsx          # 점검 상세
```

---

## 4. 데이터 모델

### 4-1. TB_SURVEY (실사 마스터)

> 엔티티 클래스: `com.telcom.equip.entity.Survey`

| 컬럼명 | Java 필드 | Java 타입 | DB 타입 | 제약조건 | 설명 |
|--------|-----------|-----------|---------|----------|------|
| `survey_id` | `surveyId` | `Long` | BIGINT | PK, IDENTITY (자동증가) | 실사 고유 ID |
| `survey_no` | `surveyNo` | `String` | VARCHAR(30) | UNIQUE, NOT NULL | 실사번호 (관리자 입력) |
| `survey_name` | `surveyName` | `String` | VARCHAR(100) | NOT NULL | 실사명 |
| `start_date` | `startDate` | `LocalDate` | DATE | nullable | 실사 시작일 |
| `end_date` | `endDate` | `LocalDate` | DATE | nullable | 실사 종료일 |
| `description` | `description` | `String` | TEXT | nullable | 대상 범위 메모 |
| `status` | `status` | `String` | VARCHAR(10) | NOT NULL, 기본값 `"OPEN"` | 상태 (`OPEN` / `CLOSED`) |
| `closed_at` | `closedAt` | `LocalDateTime` | TIMESTAMP | nullable | 완료 처리 일시 |
| `closed_by` | `closedBy` | `String` | VARCHAR(50) | nullable | 완료 처리자 |
| `created_at` | `createdAt` | `LocalDateTime` | TIMESTAMP | `updatable = false` | 등록일시 (`@PrePersist`로 자동 설정) |

**생명주기 콜백:**
- `@PrePersist`: `createdAt = LocalDateTime.now()`, `status`가 null이면 `"OPEN"` 설정

### 4-2. TB_ASSET (자산 마스터)

> 엔티티 클래스: `com.telcom.equip.entity.Asset`

| 컬럼명 | Java 필드 | Java 타입 | DB 타입 | 제약조건 | 설명 |
|--------|-----------|-----------|---------|----------|------|
| `asset_id` | `assetId` | `Long` | BIGINT | PK, IDENTITY | 자산 고유 ID |
| `asset_no` | `assetNo` | `String` | VARCHAR(30) | UNIQUE, NOT NULL | 자산번호 |
| `asset_name` | `assetName` | `String` | VARCHAR(100) | NOT NULL | 장비명 |
| `category` | `category` | `String` | VARCHAR(20) | nullable | 분류 (스위치/서버/AP 등) |
| `location_building` | `locationBuilding` | `String` | VARCHAR(50) | nullable | 건물 |
| `location_floor` | `locationFloor` | `String` | VARCHAR(10) | nullable | 층 |
| `location_room` | `locationRoom` | `String` | VARCHAR(50) | nullable | 실/공간 |
| `rack_position` | `rackPosition` | `String` | VARCHAR(30) | nullable | 랙 위치 |
| `ip_address` | `ipAddress` | `String` | VARCHAR(40) | nullable | 관리 IP |
| `serial_no` | `serialNo` | `String` | VARCHAR(60) | nullable | 시리얼번호 |
| `status` | `status` | `String` | VARCHAR(10) | nullable | 운영상태 (운영중/폐기/보관) |
| `created_at` | `createdAt` | `LocalDateTime` | TIMESTAMP | `updatable = false` | 등록일시 |
| `updated_at` | `updatedAt` | `LocalDateTime` | TIMESTAMP | | 수정일시 |

**생명주기 콜백:**
- `@PrePersist`: `createdAt`, `updatedAt` 모두 `LocalDateTime.now()` 설정
- `@PreUpdate`: `updatedAt = LocalDateTime.now()`

### 4-3. TB_INSPECTION (점검 결과)

> 엔티티 클래스: `com.telcom.equip.entity.Inspection`

| 컬럼명 | Java 필드 | Java 타입 | DB 타입 | 제약조건 | 설명 |
|--------|-----------|-----------|---------|----------|------|
| `inspection_id` | `inspectionId` | `Long` | BIGINT | PK, IDENTITY | 점검 고유 ID |
| `survey_id` | `survey` | `Survey` (ManyToOne, LAZY) | BIGINT FK | NOT NULL | 실사 참조 |
| `asset_id` | `asset` | `Asset` (ManyToOne, LAZY) | BIGINT FK | NOT NULL | 자산 참조 |
| `inspect_dt` | `inspectDt` | `LocalDateTime` | TIMESTAMP | nullable | 점검 일시 |
| `inspector_name` | `inspectorName` | `String` | VARCHAR(50) | nullable | 작업자 이름 |
| `result` | `result` | `String` | VARCHAR(10) | nullable | 결과 (`정상` / `이상` / `보류`) |
| `field_memo` | `fieldMemo` | `String` | TEXT | nullable | 점검 메모 |
| `admin_memo` | `adminMemo` | `String` | TEXT | nullable | 관리자 보완 내용 |
| `created_at` | `createdAt` | `LocalDateTime` | TIMESTAMP | `updatable = false` | 최초 등록일시 |
| `updated_at` | `updatedAt` | `LocalDateTime` | TIMESTAMP | | 최종 수정일시 |

**관계:**
- `@ManyToOne(fetch = FetchType.LAZY)` → `Survey` (`survey_id` FK)
- `@ManyToOne(fetch = FetchType.LAZY)` → `Asset` (`asset_id` FK)
- `@OneToMany(mappedBy = "inspection", cascade = CascadeType.ALL, orphanRemoval = true)` → `List<InspectionFile>` (`files` 필드)

**생명주기 콜백:**
- `@PrePersist`: `createdAt`, `updatedAt` 모두 `LocalDateTime.now()`
- `@PreUpdate`: `updatedAt = LocalDateTime.now()`

### 4-4. TB_INSPECTION_FILE (첨부 사진)

> 엔티티 클래스: `com.telcom.equip.entity.InspectionFile`

| 컬럼명 | Java 필드 | Java 타입 | DB 타입 | 제약조건 | 설명 |
|--------|-----------|-----------|---------|----------|------|
| `file_id` | `fileId` | `Long` | BIGINT | PK, IDENTITY | 파일 고유 ID |
| `inspection_id` | `inspection` | `Inspection` (ManyToOne, LAZY) | BIGINT FK | NOT NULL | 점검 결과 참조 |
| `file_path` | `filePath` | `String` | VARCHAR(300) | nullable | 서버 저장 파일명 (UUID 기반) |
| `file_name` | `fileName` | `String` | VARCHAR(100) | nullable | 원본 파일명 |
| `file_size` | `fileSize` | `Long` | BIGINT | nullable | 파일 크기 (bytes) |
| `exif_lat` | `exifLat` | `Double` | DOUBLE | nullable | 사진 EXIF 위도 (없으면 NULL) |
| `exif_lng` | `exifLng` | `Double` | DOUBLE | nullable | 사진 EXIF 경도 (없으면 NULL) |
| `exif_taken_at` | `exifTakenAt` | `LocalDateTime` | TIMESTAMP | nullable | 사진 촬영 일시 (EXIF) |
| `created_at` | `createdAt` | `LocalDateTime` | TIMESTAMP | `updatable = false` | 업로드 일시 |

**관계:**
- `@ManyToOne(fetch = FetchType.LAZY)` → `Inspection` (`inspection_id` FK)

### 4-5. TB_ADMIN_SETTING (관리자 설정)

> 엔티티 클래스: `com.telcom.equip.entity.AdminSetting`

| 컬럼명 | Java 필드 | Java 타입 | DB 타입 | 제약조건 | 설명 |
|--------|-----------|-----------|---------|----------|------|
| `id` | `id` | `Long` | BIGINT | PK, IDENTITY | 설정 고유 ID |
| `setting_key` | `settingKey` | `String` | VARCHAR(255) | UNIQUE, NOT NULL | 설정 키 |
| `setting_value` | `settingValue` | `String` | TEXT | nullable | 설정 값 |

**사용 용도:**
- `setting_key = "admin_password"`: BCrypt 해시된 관리자 비밀번호 저장

### 4-6. 엔티티 관계도 (ER)

```
TB_SURVEY (1) ──── (N) TB_INSPECTION (N) ──── (1) TB_ASSET
                            │
                            │ (1:N, cascade ALL, orphanRemoval)
                            │
                       TB_INSPECTION_FILE

TB_ADMIN_SETTING (독립 — 관계 없음)
```

---

## 5. API 명세

> 모든 응답의 JSON 필드명은 `SNAKE_CASE`이다 (`spring.jackson.property-naming-strategy=SNAKE_CASE` 설정).

### 5-1. 실사(Survey) API

> 컨트롤러: `com.telcom.equip.controller.SurveyController` (`@RequestMapping("/api/surveys")`)
> 서비스: `com.telcom.equip.service.SurveyService`

#### GET /api/surveys — 실사 목록 조회

| 항목 | 내용 |
|------|------|
| 파라미터 | 없음 |
| 응답 | `List<SurveyResponse>` — `200 OK` |
| 응답 필드 | `survey_id`, `survey_no`, `survey_name`, `start_date`, `end_date`, `description`, `status`, `closed_at`, `closed_by`, `created_at` |

#### POST /api/surveys — 실사 등록

| 항목 | 내용 |
|------|------|
| 요청 바디 | `SurveyRequest` (JSON) |
| 요청 필드 | `survey_no` (String, 필수), `survey_name` (String, 필수), `start_date` (LocalDate), `end_date` (LocalDate), `description` (String) |
| 응답 | `SurveyResponse` — `200 OK` |
| 비고 | `status`는 자동으로 `"OPEN"` 설정 |

#### PUT /api/surveys/{id} — 실사 수정

| 항목 | 내용 |
|------|------|
| 경로 변수 | `id` (Long) — 실사 ID |
| 요청 바디 | `SurveyRequest` (JSON) |
| 응답 | `SurveyResponse` — `200 OK` |
| 오류 | `404 Not Found` — "Survey not found: {id}" |

#### POST /api/surveys/{id}/close — 실사 완료 처리

| 항목 | 내용 |
|------|------|
| 경로 변수 | `id` (Long) |
| 요청 바디 | `{ "closedBy": "처리자이름" }` (선택, nullable) |
| 응답 | `SurveyResponse` — `200 OK` |
| 동작 | `status → "CLOSED"`, `closedAt → now()`, `closedBy → 요청값` |
| 오류 | `404 Not Found` |

#### POST /api/surveys/{id}/reopen — 실사 재오픈

| 항목 | 내용 |
|------|------|
| 경로 변수 | `id` (Long) |
| 요청 바디 | 없음 |
| 응답 | `SurveyResponse` — `200 OK` |
| 동작 | `status → "OPEN"`, `closedAt → null`, `closedBy → null` |

#### DELETE /api/surveys/{id} — 실사 삭제

| 항목 | 내용 |
|------|------|
| 경로 변수 | `id` (Long) |
| 응답 | `204 No Content` |
| 제약 | 해당 실사에 점검 내역이 존재하면 `400 Bad Request` 반환 — "점검 내역이 있는 실사는 삭제할 수 없습니다." |
| 검증 | `InspectionRepository.existsBySurveySurveyId(id)` |

### 5-2. 자산(Asset) API

> 컨트롤러: `com.telcom.equip.controller.AssetController` (`@RequestMapping("/api/assets")`)
> 서비스: `com.telcom.equip.service.AssetService`

#### GET /api/assets — 자산 목록 조회

| 항목 | 내용 |
|------|------|
| 쿼리 파라미터 | `search` (String, 선택) — 자산번호 또는 장비명 LIKE 검색 |
| 응답 | `List<AssetResponse>` — `200 OK` |
| 응답 필드 | `asset_id`, `asset_no`, `asset_name`, `category`, `location_building`, `location_floor`, `location_room`, `rack_position`, `ip_address`, `serial_no`, `status`, `created_at`, `updated_at` |
| 검색 쿼리 | `SELECT a FROM Asset a WHERE a.assetNo LIKE %:search% OR a.assetName LIKE %:search%` |

#### POST /api/assets — 자산 등록

| 항목 | 내용 |
|------|------|
| 요청 바디 | `AssetRequest` (JSON) |
| 요청 필드 | `asset_no`, `asset_name`, `category`, `location_building`, `location_floor`, `location_room`, `rack_position`, `ip_address`, `serial_no`, `status` |
| 응답 | `AssetResponse` — `200 OK` |

#### PUT /api/assets/{id} — 자산 수정

| 항목 | 내용 |
|------|------|
| 경로 변수 | `id` (Long) |
| 요청 바디 | `AssetRequest` (JSON) |
| 응답 | `AssetResponse` — `200 OK` |
| 오류 | `404 Not Found` |

#### DELETE /api/assets/{id} — 자산 삭제

| 항목 | 내용 |
|------|------|
| 경로 변수 | `id` (Long) |
| 응답 | `204 No Content` |

#### GET /api/assets/download — 자산 Excel 다운로드

| 항목 | 내용 |
|------|------|
| 파라미터 | 없음 |
| 응답 | `byte[]` — XLSX 파일 바이너리 |
| Content-Type | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` |
| Content-Disposition | `attachment; filename=assets.xlsx` |
| Excel 시트명 | `"자산목록"` |
| Excel 컬럼 | 자산번호, 장비명, 분류, 건물, 층, 실/공간, 랙 위치, 관리 IP, 시리얼번호, 운영상태 |
| 구현 | Apache POI `XSSFWorkbook`, 헤더 볼드체, 컬럼 자동 너비 조정 |

### 5-3. 점검(Inspection) API

> 컨트롤러: `com.telcom.equip.controller.InspectionController` (경로 수동 매핑)
> 서비스: `com.telcom.equip.service.InspectionService`

#### GET /api/surveys/{surveyId}/inspections — 실사별 점검 목록

| 항목 | 내용 |
|------|------|
| 경로 변수 | `surveyId` (Long) |
| 응답 | `List<InspectionResponse>` — `200 OK` |
| 정렬 | `inspectDt DESC` |
| 레포지토리 | `findBySurveySurveyIdOrderByInspectDtDesc(surveyId)` |

#### GET /api/inspections/{id} — 점검 상세

| 항목 | 내용 |
|------|------|
| 경로 변수 | `id` (Long) |
| 응답 | `InspectionResponse` — `200 OK` |
| 오류 | `404 Not Found` |

**InspectionResponse 전체 필드:**

| 필드 | 타입 | 설명 |
|------|------|------|
| `inspection_id` | Long | 점검 ID |
| `survey_id` | Long | 실사 ID |
| `survey_no` | String | 실사번호 |
| `asset_id` | Long | 자산 ID |
| `asset_no` | String | 자산번호 |
| `asset_name` | String | 장비명 |
| `inspect_dt` | LocalDateTime | 점검 일시 |
| `inspector_name` | String | 작업자 이름 |
| `result` | String | 결과 (정상/이상/보류) |
| `field_memo` | String | 점검 메모 |
| `admin_memo` | String | 관리자 메모 |
| `survey_status` | String | 실사 상태 (OPEN/CLOSED) |
| `created_at` | LocalDateTime | 등록일시 |
| `updated_at` | LocalDateTime | 수정일시 |
| `files` | List&lt;FileInfo&gt; | 첨부 파일 목록 |

**FileInfo 내부 record 필드:**

| 필드 | 타입 | 설명 |
|------|------|------|
| `file_id` | Long | 파일 ID |
| `file_path` | String | 저장 경로 (UUID 파일명) |
| `file_name` | String | 원본 파일명 |
| `file_size` | Long | 파일 크기 (bytes) |
| `exif_lat` | Double | EXIF 위도 |
| `exif_lng` | Double | EXIF 경도 |
| `exif_taken_at` | LocalDateTime | EXIF 촬영일시 |
| `created_at` | LocalDateTime | 업로드 일시 |

#### GET /api/assets/{assetId}/inspections/latest — 자산의 최근 점검 조회

| 항목 | 내용 |
|------|------|
| 경로 변수 | `assetId` (Long) |
| 응답 (있음) | `InspectionResponse` — `200 OK` |
| 응답 (없음) | `204 No Content` |
| 레포지토리 | `findByAssetIdOrderByInspectDtDesc(assetId)` → 첫 번째 결과 |

#### POST /api/surveys/{surveyId}/inspections — 점검 등록

| 항목 | 내용 |
|------|------|
| 경로 변수 | `surveyId` (Long) |
| 요청 바디 | `InspectionRequest` (JSON) |
| 요청 필드 | `asset_id` (Long, 필수), `inspect_dt` (LocalDateTime), `inspector_name` (String), `result` (String), `field_memo` (String), `admin_memo` (String) |
| 응답 | `InspectionResponse` — `200 OK` |
| 잠금 체크 | `survey.status == "CLOSED"` → `403 Forbidden` (SurveyClosedException) |

#### PUT /api/inspections/{id} — 점검 수정

| 항목 | 내용 |
|------|------|
| 경로 변수 | `id` (Long) |
| 요청 바디 | `InspectionRequest` (JSON) |
| 응답 | `InspectionResponse` — `200 OK` |
| 잠금 체크 | `survey.status == "CLOSED"` → `403 Forbidden` |
| 비고 | `assetId`가 null이 아니면 자산 변경 가능 |

#### DELETE /api/inspections/{id} — 점검 삭제

| 항목 | 내용 |
|------|------|
| 경로 변수 | `id` (Long) |
| 응답 | `204 No Content` |
| 잠금 체크 | `survey.status == "CLOSED"` → `403 Forbidden` |
| 부수 효과 | 연결된 모든 물리 파일(`InspectionFile.filePath`)을 `FileStorageService.deleteFile()`로 삭제 |

#### POST /api/inspections/{id}/files — 사진 업로드

| 항목 | 내용 |
|------|------|
| 경로 변수 | `id` (Long) — 점검 ID |
| 요청 | `multipart/form-data`, 필드명 `"files"`, `MultipartFile[]` |
| 응답 | `List<FileInfo>` — `200 OK` |
| 잠금 체크 | `survey.status == "CLOSED"` → `403 Forbidden` |
| 파일 크기 제한 | 단일 파일: `20MB`, 전체 요청: `100MB` |
| EXIF 처리 | 업로드 시 자동으로 GPS 좌표 + 촬영일시 추출 (상세 6장 참고) |

#### DELETE /api/inspections/{id}/files/{fileId} — 사진 삭제

| 항목 | 내용 |
|------|------|
| 경로 변수 | `id` (Long) — 점검 ID, `fileId` (Long) — 파일 ID |
| 응답 | `204 No Content` |
| 잠금 체크 | `survey.status == "CLOSED"` → `403 Forbidden` |
| 부수 효과 | 물리 파일 삭제 (`Files.deleteIfExists`) |

#### GET /api/inspections/map — 지도용 GPS 점검 마커 목록

| 항목 | 내용 |
|------|------|
| 쿼리 파라미터 | `survey_id` (Long, 선택), `result` (String, 선택) |
| 응답 | `List<MapMarkerResponse>` — `200 OK` |
| 필터링 | `exif_lat IS NOT NULL AND exif_lng IS NOT NULL` 조건 필수 |
| 그룹핑 | 점검(inspection) 단위로 그룹핑하여 GPS가 있는 첫 번째 사진만 사용 |
| 응답 필드 | `inspection_id`, `asset_no`, `asset_name`, `inspect_dt`, `inspector_name`, `result`, `exif_lat`, `exif_lng`, `thumbnail_url` |
| `thumbnail_url` 형식 | `"/api/files/{filePath}"` |

**레포지토리 쿼리 분기:**

| 조건 | 메서드 |
|------|--------|
| `surveyId` + `result` 모두 있음 | `findAllWithGpsBySurveyIdAndResult(surveyId, result)` |
| `surveyId`만 있음 | `findAllWithGpsBySurveyId(surveyId)` |
| `result`만 있음 | `findAllWithGpsByResult(result)` |
| 모두 없음 | `findAllWithGps()` |

### 5-4. 관리자(Admin) API

> 컨트롤러: `com.telcom.equip.controller.AdminController` (`@RequestMapping("/api")`)
> 서비스: `com.telcom.equip.service.AdminService`

#### POST /api/admin/verify — 비밀번호 검증

| 항목 | 내용 |
|------|------|
| 요청 바디 | `{ "password": "입력한 비밀번호" }` |
| 응답 (성공) | `{ "success": true }` — `200 OK` |
| 응답 (실패) | `{ "success": false }` — `200 OK` |
| 동작 | `BCryptPasswordEncoder.matches(password, 저장된해시)` |

#### PUT /api/admin/password — 비밀번호 변경

| 항목 | 내용 |
|------|------|
| 요청 바디 | `AdminPasswordRequest` — `{ "current_password": "...", "new_password": "..." }` |
| 응답 (성공) | `{ "success": true }` — `200 OK` |
| 응답 (실패) | `{ "success": false, "message": "현재 비밀번호가 일치하지 않습니다." }` — `400 Bad Request` |
| 동작 | 현재 비밀번호 검증 후 `encoder.encode(newPassword)`로 갱신 |

#### GET /api/dashboard — 대시보드 통계

| 항목 | 내용 |
|------|------|
| 파라미터 | 없음 |
| 응답 | `DashboardResponse` — `200 OK` |

**DashboardResponse 필드:**

| 필드 | 타입 | 설명 | 산출 로직 |
|------|------|------|-----------|
| `active_survey_count` | long | 진행중 실사 수 | `surveyRepository.countByStatus("OPEN")` |
| `total_asset_count` | long | 전체 자산 수 | `assetRepository.count()` |
| `today_inspection_count` | long | 금일 점검 수 | `inspectionRepository.countByInspectDtBetween(오늘 00:00, 오늘 23:59:59.999)` |
| `abnormal_count` | long | 이상 장비 수 | `inspectionRepository.countByResult("이상")` |

### 5-5. 파일 서빙

> 설정: `com.telcom.equip.config.WebConfig.addResourceHandlers()`

| URL 패턴 | 물리 경로 | 설명 |
|----------|-----------|------|
| `/api/files/**` | `file:{uploadDir}/` | 업로드된 파일 정적 서빙 |

### 5-6. 전역 예외 처리

> 클래스: `com.telcom.equip.config.GlobalExceptionHandler` (`@RestControllerAdvice`)

| 예외 | HTTP 상태 | 응답 바디 |
|------|-----------|-----------|
| `InspectionService.SurveyClosedException` | `403 Forbidden` | `{ "error": "SURVEY_CLOSED", "message": "완료된 실사입니다...", "timestamp": "..." }` |
| `IllegalStateException` | `400 Bad Request` | `{ "error": "BAD_REQUEST", "message": "...", "timestamp": "..." }` |
| `RuntimeException` (메시지에 "not found" 포함) | `404 Not Found` | `{ "error": "Not Found", "message": "...", "timestamp": "..." }` |
| `RuntimeException` (기타) | `500 Internal Server Error` | `{ "error": "Internal Server Error", "message": "...", "timestamp": "..." }` |

---

## 6. 관리자 인증

### 6-1. 암호 해싱

- **알고리즘**: BCrypt
- **라이브러리**: `org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder`
- **빈 등록**: `TelcomEquipApplication` 클래스에서 `@Bean`으로 등록
- **저장 위치**: `TB_ADMIN_SETTING` 테이블, `setting_key = "admin_password"`, `setting_value`에 BCrypt 해시 저장

### 6-2. 초기 비밀번호

- `TelcomEquipApplication`에 `CommandLineRunner` 빈으로 구현
- 앱 기동 시 `admin_password` 키가 없으면 `encoder.encode("admin1234")` 값으로 자동 생성
- **초기 비밀번호**: `admin1234`

### 6-3. 검증 API

- `POST /api/admin/verify` → `AdminService.verifyPassword(password)`
- `encoder.matches(rawPassword, storedHash)` 호출
- 결과를 `{ "success": true/false }` 형태로 반환

### 6-4. 변경 API

- `PUT /api/admin/password` → `AdminService.changePassword(currentPassword, newPassword)`
- 현재 비밀번호가 일치하지 않으면 `400 Bad Request` 반환
- 일치 시 `encoder.encode(newPassword)`로 갱신

### 6-5. 프론트엔드 인증 흐름

1. **`AdminLayout`** 컴포넌트가 관리자 경로(`/admin/*`)를 래핑
2. `useAdminAuth()` 훅으로 인증 상태 확인
3. 미인증 시 `AdminPasswordDialog` 모달 표시
4. 사용자가 비밀번호 입력 → `verifyAdminPassword(password)` 호출 (`POST /api/admin/verify`)
5. 성공 시 `login()` 호출하여 세션 상태 업데이트
6. 취소 시 `navigate('/')` — 홈으로 이동
7. 오류 메시지: `"비밀번호가 올바르지 않습니다."` (401), `"서버 오류가 발생했습니다."` (기타)

---

## 7. 실사 잠금(Lock) 처리

### 7-1. 잠금 조건

| 조건 | 등록 | 수정 | 삭제 |
|------|------|------|------|
| `survey.status = "OPEN"` | 허용 | 허용 | 허용 |
| `survey.status = "CLOSED"` | **불가** | **불가** | **불가** |

### 7-2. API 레벨 체크

`InspectionService` 내부의 `checkSurveyOpen(Survey survey)` 메서드에서 검증:

```java
private void checkSurveyOpen(Survey survey) {
    if ("CLOSED".equals(survey.getStatus())) {
        throw new SurveyClosedException("완료된 실사입니다. 등록·수정·삭제가 불가합니다.");
    }
}
```

**잠금 체크가 적용되는 API:**

| 메서드 | 엔드포인트 | 서비스 메서드 |
|--------|-----------|---------------|
| POST | `/api/surveys/{surveyId}/inspections` | `create()` |
| PUT | `/api/inspections/{id}` | `update()` |
| DELETE | `/api/inspections/{id}` | `delete()` |
| POST | `/api/inspections/{id}/files` | `uploadFiles()` |
| DELETE | `/api/inspections/{id}/files/{fileId}` | `deleteFile()` |

### 7-3. 예외 처리

- `SurveyClosedException` (`InspectionService` 내부 static 클래스, `RuntimeException` 상속)
- `GlobalExceptionHandler`에서 `403 Forbidden`으로 매핑
- 응답 형태: `{ "error": "SURVEY_CLOSED", "message": "완료된 실사입니다. 등록·수정·삭제가 불가합니다.", "timestamp": "..." }`

### 7-4. 프론트엔드 UI 비활성화

- `InspectionResponse`에 `survey_status` 필드 포함 (`"OPEN"` 또는 `"CLOSED"`)
- 프론트엔드에서 `survey_status === "CLOSED"` 여부를 확인하여:
  - 점검 등록 버튼 비활성화
  - 수정/삭제 버튼 비활성화
  - 모든 입력 필드 `disabled` 처리
  - `"완료된 실사입니다"` 안내 메시지 표시
- 이중 방어 구조: 프론트엔드 UI 비활성화 + 백엔드 API 레벨 403 반환

---

## 8. 사진 EXIF GPS 추출

### 8-1. 라이브러리

- **metadata-extractor** `2.19.0` (`com.drewnoakes:metadata-extractor`)
- Gradle 의존성: `implementation("com.drewnoakes:metadata-extractor:2.19.0")`

### 8-2. 추출 로직

> 구현 위치: `com.telcom.equip.service.FileStorageService.storeFile(MultipartFile file)`

1. 파일을 디스크에 저장 (`UUID + 원본 확장자`)
2. 동일 파일의 `InputStream`으로 EXIF 파싱 시도
3. **GPS 추출**: `GpsDirectory` → `getGeoLocation()` → `getLatitude()`, `getLongitude()`
4. **촬영일시 추출**: `ExifSubIFDDirectory` → `getDateOriginal()` → `LocalDateTime` 변환
5. 파싱 실패 시 (이미지가 아니거나 EXIF 없음) → `null` 유지, 예외 무시

### 8-3. 사용 클래스

| 클래스 (com.drew.*) | 용도 |
|---------------------|------|
| `com.drew.imaging.ImageMetadataReader` | EXIF 메타데이터 읽기 진입점 |
| `com.drew.metadata.Metadata` | 메타데이터 컨테이너 |
| `com.drew.metadata.exif.GpsDirectory` | GPS 좌표 디렉터리 |
| `com.drew.metadata.exif.ExifSubIFDDirectory` | 촬영일시 등 EXIF 정보 |

### 8-4. 저장 방식

| 필드 | 값 | NULL 조건 |
|------|-----|-----------|
| `exif_lat` | GPS 위도 (Double) | 사진에 GPS EXIF 없음 |
| `exif_lng` | GPS 경도 (Double) | 사진에 GPS EXIF 없음 |
| `exif_taken_at` | 촬영일시 (LocalDateTime) | EXIF에 DateOriginal 없음 |

### 8-5. 파일 저장 구조

- **저장 디렉토리**: `${file.upload-dir}` (기본값 `./uploads`, Docker 환경 `/app/uploads`)
- **파일명**: `UUID.randomUUID() + 원본확장자` (예: `a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg`)
- **초기화**: `@PostConstruct`에서 `Files.createDirectories()` 호출
- **삭제**: `Files.deleteIfExists()` — 실패 시 예외 무시 (best-effort)

---

## 9. 지도 기능

### 9-1. Leaflet 설정

| 항목 | 값 |
|------|-----|
| 프론트엔드 라이브러리 | `leaflet ^1.9.4`, `react-leaflet ^4.2.1` |
| 타일 제공자 | OpenStreetMap (API 키 불필요, 무료) |
| TypeScript 타입 | `@types/leaflet ^1.9.12` |

### 9-2. 마커 색상 규칙

| 점검 결과 (`result`) | 마커 색상 |
|----------------------|-----------|
| `"정상"` | 초록 (green) |
| `"이상"` | 빨강 (red) |
| `"보류"` | 주황 (orange) |

### 9-3. 팝업 내용

마커 클릭 시 팝업에 표시되는 정보 (`MapMarkerResponse` 기반):

| 항목 | 필드 |
|------|------|
| 자산번호 | `asset_no` |
| 장비명 | `asset_name` |
| 작업자 | `inspector_name` |
| 점검일시 | `inspect_dt` |
| 점검 결과 | `result` |
| 사진 썸네일 | `thumbnail_url` → `/api/files/{filePath}` |

### 9-4. 데이터 흐름

```
사진 업로드 → FileStorageService.storeFile()
    → EXIF GPS 추출 → InspectionFile.exifLat/exifLng 저장
    → DB에 저장 (exif_lat, exif_lng NOT NULL인 레코드만)

지도 화면 → GET /api/inspections/map?survey_id=X&result=Y
    → InspectionFileRepository: exifLat IS NOT NULL AND exifLng IS NOT NULL 조건 쿼리
    → 점검(inspection) 단위 그룹핑, GPS 있는 첫 번째 사진 선택
    → MapMarkerResponse 목록 반환
    → 프론트엔드: react-leaflet 마커 렌더링
```

### 9-5. 필터링

- **실사번호별 필터**: `survey_id` 쿼리 파라미터
- **점검 결과별 필터**: `result` 쿼리 파라미터 (`정상`, `이상`, `보류`)
- 두 필터 동시 적용 가능
- 필터 없으면 전체 GPS 데이터 표시

---

## 10. 프론트엔드 화면 구성

### 10-1. 라우팅 구조

> 정의 위치: `frontend/src/App.tsx`

| 경로 | 컴포넌트 | 레이아웃 | 설명 |
|------|----------|----------|------|
| `/` | `HomePage` | 없음 | 홈 (역할 선택: 관리자/작업자) |
| `/admin` | `Dashboard` | `AdminLayout` | 대시보드 |
| `/admin/surveys` | `SurveyManagement` | `AdminLayout` | 실사 관리 |
| `/admin/assets` | `AssetManagement` | `AdminLayout` | 자산 관리 |
| `/admin/inspections` | `AdminInspectionList` | `AdminLayout` | 점검 목록 (관리자) |
| `/admin/map` | `MapView` | `AdminLayout` | 지도 뷰 |
| `/admin/settings` | `Settings` | `AdminLayout` | 설정 (비밀번호 변경) |
| `/worker` | `SurveySelect` | `Layout (type="worker")` | 실사번호 선택 |
| `/worker/survey/:surveyId/inspections` | `WorkerInspectionList` | `Layout (type="worker")` | 점검 목록 (작업자) |
| `/worker/survey/:surveyId/inspections/new` | `InspectionForm` | `Layout (type="worker")` | 점검 등록 |
| `/worker/survey/:surveyId/inspections/:inspectionId/edit` | `InspectionForm` | `Layout (type="worker")` | 점검 수정 |
| `/worker/inspections/:inspectionId` | `InspectionDetail` | `Layout (type="worker")` | 점검 상세 |
| `*` | `Navigate to="/"` | — | 폴백 (홈으로 리다이렉트) |

### 10-2. 공통 컴포넌트

| 컴포넌트 | 파일 | 설명 |
|----------|------|------|
| `Layout` | `components/Layout.tsx` | 공통 레이아웃, `type` prop으로 admin/worker 구분 |
| `AdminLayout` | `components/AdminLayout.tsx` | 관리자 레이아웃 — `useAdminAuth()` 훅으로 인증 게이트 구현, 미인증 시 `AdminPasswordDialog` 표시 |
| `AdminPasswordDialog` | `components/AdminPasswordDialog.tsx` | 모달 형태 비밀번호 입력, `verifyAdminPassword()` API 호출 |
| `Loading` | `components/Loading.tsx` | 로딩 인디케이터 |
| `ConfirmDialog` | `components/ConfirmDialog.tsx` | 확인/취소 다이얼로그 |

### 10-3. 관리자 화면 상세

#### Dashboard (`pages/admin/Dashboard.tsx`)
- `GET /api/dashboard` 호출
- 표시 항목: 진행중 실사 수, 전체 장비 수, 금일 점검 수, 이상 장비 수

#### SurveyManagement (`pages/admin/SurveyManagement.tsx`)
- 실사 목록 조회 (`GET /api/surveys`)
- 실사 등록 (`POST /api/surveys`)
- 실사 수정 (`PUT /api/surveys/{id}`)
- 실사 완료 처리 (`POST /api/surveys/{id}/close`)
- 실사 재오픈 (`POST /api/surveys/{id}/reopen`)
- 실사 삭제 (`DELETE /api/surveys/{id}`) — 점검 내역 없는 경우에만
- 진행중(OPEN) / 완료(CLOSED) 구분 표시

#### AssetManagement (`pages/admin/AssetManagement.tsx`)
- 자산 목록 조회 (`GET /api/assets?search=...`)
- 자산 등록/수정/삭제
- Excel 다운로드 (`GET /api/assets/download`)

#### AdminInspectionList (`pages/admin/InspectionList.tsx`)
- 실사번호별 전체 점검 목록 조회
- 관리자 메모(`admin_memo`) 보완 기능

#### MapView (`pages/admin/MapView.tsx`)
- `GET /api/inspections/map` 호출
- Leaflet 지도에 마커 렌더링
- 실사번호별, 결과별 필터링

#### Settings (`pages/admin/Settings.tsx`)
- 비밀번호 변경 (`PUT /api/admin/password`)

### 10-4. 작업자 화면 상세

#### SurveySelect (`pages/worker/SurveySelect.tsx`)
- 진행중인 실사번호 목록 표시 (완료된 실사는 선택 불가)
- 실사명, 기간 표시

#### WorkerInspectionList (`pages/worker/InspectionList.tsx`)
- 선택한 실사번호에 속한 점검 내역 목록
- 수정/삭제 버튼 (실사 완료 시 비활성)

#### InspectionForm (`pages/worker/InspectionForm.tsx`)
- 점검 등록/수정 공용 폼
- 경로 파라미터로 등록(`new`) / 수정(`edit`) 구분
- 자산 검색 (`GET /api/assets?search=...`)
- 이전 실사 내역 미리보기 (`GET /api/assets/{assetId}/inspections/latest`)
- 점검 결과 선택: `정상` / `이상` / `보류`
- 메모 입력
- 사진 첨부 — 카메라 촬영 또는 파일 선택, 최대 5장
- 실사 완료 시 모든 필드 비활성화

#### InspectionDetail (`pages/worker/InspectionDetail.tsx`)
- 점검 상세 정보 표시
- 첨부 사진 표시 (파일 URL: `/api/files/{filePath}`)

---

## 11. Docker 배포

### 11-1. docker-compose.yml 구성

```yaml
services:
  backend:
    build:
      context: ./backend
    environment:
      DB_PATH: /app/data/telcom.db
      UPLOAD_DIR: /app/uploads
    volumes:
      - db-data:/app/data
      - upload-data:/app/uploads
    ports:
      - "8080:8080"

  frontend:
    build:
      context: ./frontend
    ports:
      - "4000:80"
    depends_on:
      - backend

volumes:
  db-data:
  upload-data:
```

### 11-2. 서비스별 상세

| 서비스 | 빌드 컨텍스트 | 포트 매핑 | 볼륨 |
|--------|---------------|-----------|------|
| `backend` | `./backend` | `8080:8080` | `db-data:/app/data`, `upload-data:/app/uploads` |
| `frontend` | `./frontend` | `4000:80` | 없음 |

### 11-3. 볼륨

| 볼륨명 | 마운트 경로 | 용도 |
|--------|-------------|------|
| `db-data` | `/app/data` | SQLite DB 파일 (`telcom.db`) 영속화 |
| `upload-data` | `/app/uploads` | 업로드 사진 파일 영속화 |

### 11-4. 백엔드 Dockerfile

```dockerfile
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY build.gradle.kts settings.gradle.kts ./
COPY gradle ./gradle
COPY gradlew ./
RUN chmod +x gradlew && ./gradlew dependencies --no-daemon || true
COPY src ./src
RUN ./gradlew bootJar --no-daemon

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
RUN mkdir -p /app/data /app/uploads
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

- 멀티스테이지 빌드: JDK(빌드) → JRE(런타임)
- 의존성 레이어 캐싱 (`gradlew dependencies` 선행)
- 런타임에 `/app/data`, `/app/uploads` 디렉토리 생성

### 11-5. 프론트엔드 Dockerfile

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

- 멀티스테이지 빌드: Node(빌드) → Nginx(서빙)
- Vite 빌드 결과물(`dist/`)을 Nginx에 복사

### 11-6. Nginx 프록시 설정

> 파일: `frontend/nginx.conf`

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location /api/ {
        proxy_pass http://backend:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        client_max_body_size 100M;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

| 설정 | 내용 |
|------|------|
| API 프록시 | `/api/*` 요청을 `http://backend:8080`으로 전달 (Docker 서비스명 기반 DNS) |
| SPA 폴백 | 모든 비-API 요청은 `index.html`로 폴백 (React Router 지원) |
| 파일 업로드 크기 | `client_max_body_size 100M` |
| 프록시 헤더 | `Host`, `X-Real-IP`, `X-Forwarded-For` 전달 |

### 11-7. 접근 URL

| 환경 | 프론트엔드 | 백엔드 (직접) |
|------|-----------|---------------|
| Docker Compose | `http://localhost:4000` | `http://localhost:8080` |
| Nginx 프록시 경유 | `http://localhost:4000/api/*` → backend:8080 | — |

---

## 12. 환경 변수

### 12-1. 백엔드 환경 변수

| 환경 변수 | 기본값 | 설명 | 사용 위치 |
|-----------|--------|------|-----------|
| `DB_PATH` | `./data/telcom.db` | SQLite DB 파일 경로 | `application.yml` → `spring.datasource.url` |
| `UPLOAD_DIR` | `./uploads` | 파일 업로드 저장 디렉토리 | `application.yml` → `file.upload-dir` |

### 12-2. 프론트엔드 환경 변수

| 환경 변수 | 기본값 | 설명 | 사용 위치 |
|-----------|--------|------|-----------|
| `VITE_API_URL` | `""` (빈 문자열) | API 서버 기본 URL | `api/client.ts` → `axios.create({ baseURL })` |

### 12-3. Spring Boot 주요 설정값

| 설정 키 | 값 | 설명 |
|---------|-----|------|
| `spring.jackson.property-naming-strategy` | `SNAKE_CASE` | JSON 필드명 스네이크케이스 자동 변환 |
| `spring.datasource.url` | `jdbc:sqlite:${DB_PATH}` | SQLite JDBC URL |
| `spring.datasource.driver-class-name` | `org.sqlite.JDBC` | SQLite JDBC 드라이버 |
| `spring.jpa.database-platform` | `org.hibernate.community.dialect.SQLiteDialect` | Hibernate SQLite 방언 |
| `spring.jpa.hibernate.ddl-auto` | `update` | 스키마 자동 갱신 |
| `spring.jpa.show-sql` | `false` | SQL 로그 비활성화 |
| `spring.servlet.multipart.max-file-size` | `20MB` | 단일 파일 최대 크기 |
| `spring.servlet.multipart.max-request-size` | `100MB` | 전체 요청 최대 크기 |
| `file.upload-dir` | `${UPLOAD_DIR:./uploads}` | 업로드 디렉토리 |
| `server.port` | `8080` | 백엔드 서버 포트 |

### 12-4. Docker Compose 환경 변수 (backend 서비스)

| 환경 변수 | Docker 값 | 설명 |
|-----------|-----------|------|
| `DB_PATH` | `/app/data/telcom.db` | 컨테이너 내부 DB 경로 (볼륨 마운트) |
| `UPLOAD_DIR` | `/app/uploads` | 컨테이너 내부 업로드 경로 (볼륨 마운트) |

### 12-5. CORS 설정

> `WebConfig.addCorsMappings()`:

| 항목 | 값 |
|------|-----|
| 매핑 패턴 | `/api/**` |
| 허용 오리진 | `*` (모든 출처) |
| 허용 메서드 | `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS` |
| 허용 헤더 | `*` (모든 헤더) |

---

## 13. Swagger / OpenAPI 문서

### 13-1. 라이브러리

| 항목 | 내용 |
|------|------|
| 의존성 | `org.springdoc:springdoc-openapi-starter-webmvc-ui:2.8.4` |
| 설정 클래스 | `com.telcom.equip.config.SwaggerConfig` |

### 13-2. 접속 경로

| URL | 설명 |
|-----|------|
| `/swagger-ui.html` | Swagger UI (인터랙티브 API 테스트) |
| `/v3/api-docs` | OpenAPI 3.0 JSON 스펙 |
| `/v3/api-docs.yaml` | OpenAPI 3.0 YAML 스펙 |

### 13-3. API 그룹 (Tag)

| Tag | 컨트롤러 | 설명 |
|-----|----------|------|
| 실사(Survey) | `SurveyController` | 실사번호 등록·조회·완료처리·재오픈·삭제 |
| 자산(Asset) | `AssetController` | 자산 등록·조회·수정·삭제·Excel 다운로드 |
| 점검(Inspection) | `InspectionController` | 점검 등록·조회·수정·삭제, 사진 업로드, 지도 마커 |
| 관리자(Admin) | `AdminController` | 관리자 암호 검증·변경, 대시보드 |

### 13-4. OpenAPI 메타 정보

```java
new OpenAPI()
    .info(new Info()
        .title("네트워크 전산장비 실사점검 시스템 API")
        .description("실사 관리, 자산 관리, 점검 등록/조회, 사진 업로드, 지도 마커 등 전체 API")
        .version("v1.0.0"));
```

> Docker 환경에서는 `http://localhost:8080/swagger-ui.html`로 접근 가능

---

> 본 문서는 실제 구현된 소스 코드를 기반으로 작성되었으며, 프로젝트의 권위 있는 기술 참조 문서로 사용됩니다.
