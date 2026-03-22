import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getAssets,
  getLatestInspection,
  createInspection,
  updateInspection,
  getInspection,
  uploadInspectionFiles,
  deleteInspectionFile,
  getFileUrl,
  getSurveys,
} from '../../api/client';
import type { Asset, Inspection, Survey } from '../../types';
import Loading from '../../components/Loading';

export default function InspectionForm() {
  const { surveyId, inspectionId } = useParams<{ surveyId: string; inspectionId?: string }>();
  const navigate = useNavigate();
  const isEdit = !!inspectionId;

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Asset search
  const [assetSearch, setAssetSearch] = useState('');
  const [assetResults, setAssetResults] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>();

  // Previous inspection
  const [prevInspection, setPrevInspection] = useState<Inspection | null>(null);
  const [prevOpen, setPrevOpen] = useState(false);

  // Form
  const [result, setResult] = useState<'정상' | '이상' | '보류'>('정상');
  const [fieldMemo, setFieldMemo] = useState('');

  // Photos
  const [existingFiles, setExistingFiles] = useState<any[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const workerName = sessionStorage.getItem('worker_name') || '';

  useEffect(() => {
    if (!workerName) {
      navigate('/worker');
      return;
    }
    loadSurvey();
    if (isEdit) {
      loadInspection();
    }
  }, []);

  const loadSurvey = async () => {
    try {
      const surveys = await getSurveys();
      const found = surveys.find((s) => s.survey_id === Number(surveyId));
      setSurvey(found || null);
    } catch {
      // silent
    }
  };

  const loadInspection = async () => {
    if (!inspectionId) return;
    try {
      setLoading(true);
      const data = await getInspection(Number(inspectionId));
      setResult(data.result);
      setFieldMemo(data.field_memo || '');
      if (data.asset) {
        setSelectedAsset(data.asset);
        setAssetSearch(`${data.asset.asset_no} - ${data.asset.asset_name}`);
      }
      if (data.files) {
        setExistingFiles(data.files);
      }
    } catch {
      setError('점검 정보를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleAssetSearch = useCallback(
    (value: string) => {
      setAssetSearch(value);
      setSelectedAsset(null);
      setPrevInspection(null);

      if (searchTimer.current) clearTimeout(searchTimer.current);

      if (value.trim().length < 1) {
        setAssetResults([]);
        setShowAutocomplete(false);
        return;
      }

      searchTimer.current = setTimeout(async () => {
        try {
          const data = await getAssets(value.trim());
          setAssetResults(data);
          setShowAutocomplete(data.length > 0);
        } catch {
          setAssetResults([]);
        }
      }, 300);
    },
    []
  );

  const handleSelectAsset = async (asset: Asset) => {
    setSelectedAsset(asset);
    setAssetSearch(`${asset.asset_no} - ${asset.asset_name}`);
    setShowAutocomplete(false);
    setAssetResults([]);

    // Load previous inspection
    try {
      const prev = await getLatestInspection(asset.asset_id);
      setPrevInspection(prev);
      setPrevOpen(true);
    } catch {
      setPrevInspection(null);
    }
  };

  const handleFileAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const totalCount = existingFiles.length + newFiles.length;
    const remaining = 5 - totalCount;
    if (remaining <= 0) {
      setError('사진은 최대 5장까지 첨부할 수 있습니다.');
      return;
    }

    const filesToAdd = Array.from(files).slice(0, remaining);
    setNewFiles((prev) => [...prev, ...filesToAdd]);

    const previews = filesToAdd.map((f) => URL.createObjectURL(f));
    setFilePreviews((prev) => [...prev, ...previews]);

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveNewFile = (index: number) => {
    URL.revokeObjectURL(filePreviews[index]);
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingFile = async (fileId: number) => {
    if (!inspectionId) return;
    try {
      await deleteInspectionFile(Number(inspectionId), fileId);
      setExistingFiles((prev) => prev.filter((f) => f.file_id !== fileId));
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('완료된 실사의 사진은 삭제할 수 없습니다.');
      } else {
        setError('사진 삭제에 실패했습니다.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedAsset) {
      setError('자산을 선택하세요.');
      return;
    }

    try {
      setSaving(true);
      let savedInspectionId: number;

      if (isEdit) {
        await updateInspection(Number(inspectionId), {
          result,
          field_memo: fieldMemo,
        });
        savedInspectionId = Number(inspectionId);
      } else {
        const created = await createInspection(Number(surveyId), {
          asset_id: selectedAsset.asset_id,
          inspector_name: workerName,
          result,
          field_memo: fieldMemo,
        });
        savedInspectionId = created.inspection_id;
      }

      // Upload new files
      if (newFiles.length > 0) {
        await uploadInspectionFiles(savedInspectionId, newFiles);
      }

      navigate(`/worker/survey/${surveyId}/inspections`);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('완료된 실사에는 점검을 등록/수정할 수 없습니다.');
      } else {
        setError(err.response?.data?.message || '저장에 실패했습니다.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  const totalPhotos = existingFiles.length + newFiles.length;

  return (
    <div>
      <div className="page-header">
        <h2>{isEdit ? '점검 수정' : '점검 등록'}</h2>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          취소
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="card">
        <form onSubmit={handleSubmit}>
          {/* Survey info */}
          <div className="form-group">
            <label>실사</label>
            <input
              className="form-control"
              value={survey ? `${survey.survey_no} - ${survey.survey_name}` : `실사 #${surveyId}`}
              readOnly
              disabled
            />
          </div>

          {/* Worker name */}
          <div className="form-group">
            <label>작업자</label>
            <input className="form-control" value={workerName} readOnly disabled />
          </div>

          {/* Asset search */}
          <div className="form-group">
            <label>자산 검색 *</label>
            <div className="autocomplete-wrapper">
              <input
                className="form-control"
                placeholder="자산번호 또는 장비명 입력"
                value={assetSearch}
                onChange={(e) => handleAssetSearch(e.target.value)}
                onFocus={() => assetResults.length > 0 && setShowAutocomplete(true)}
                onBlur={() => setTimeout(() => setShowAutocomplete(false), 200)}
                disabled={isEdit}
              />
              {showAutocomplete && (
                <div className="autocomplete-list">
                  {assetResults.map((a) => (
                    <div
                      key={a.asset_id}
                      className="autocomplete-item"
                      onMouseDown={() => handleSelectAsset(a)}
                    >
                      <strong>{a.asset_no}</strong>
                      <span>{a.asset_name}</span>
                      {a.location_building && (
                        <span style={{ marginLeft: 4, fontSize: '0.75rem' }}>
                          ({a.location_building} {a.location_floor})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Previous inspection */}
          {prevInspection && (
            <div className="prev-inspection-panel">
              <div className="prev-inspection-header" onClick={() => setPrevOpen(!prevOpen)}>
                <span>이전 실사 내역</span>
                <span>{prevOpen ? '\u25B2' : '\u25BC'}</span>
              </div>
              {prevOpen && (
                <div className="prev-inspection-body">
                  <div className="info-row">
                    <span className="info-label">점검일시</span>
                    <span>{new Date(prevInspection.inspect_dt).toLocaleString('ko-KR')}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">작업자</span>
                    <span>{prevInspection.inspector_name}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">결과</span>
                    <span
                      className={`badge ${
                        prevInspection.result === '정상'
                          ? 'badge-normal'
                          : prevInspection.result === '이상'
                          ? 'badge-abnormal'
                          : 'badge-pending'
                      }`}
                    >
                      {prevInspection.result}
                    </span>
                  </div>
                  {prevInspection.field_memo && (
                    <div className="info-row">
                      <span className="info-label">메모</span>
                      <span>{prevInspection.field_memo}</span>
                    </div>
                  )}
                  {prevInspection.files && prevInspection.files.length > 0 && (
                    <div className="prev-photos">
                      {prevInspection.files.map((f) => (
                        <img key={f.file_id} src={getFileUrl(f.file_path)} alt={f.file_name} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Result */}
          <div className="form-group">
            <label>점검 결과 *</label>
            <div className="radio-group">
              {(['정상', '이상', '보류'] as const).map((r) => (
                <label key={r} className="radio-option">
                  <input
                    type="radio"
                    name="result"
                    value={r}
                    checked={result === r}
                    onChange={() => setResult(r)}
                  />
                  {r}
                </label>
              ))}
            </div>
          </div>

          {/* Memo */}
          <div className="form-group">
            <label>메모 ({fieldMemo.length}/200)</label>
            <textarea
              className="form-control"
              rows={3}
              maxLength={200}
              value={fieldMemo}
              onChange={(e) => setFieldMemo(e.target.value)}
              placeholder="점검 메모를 입력하세요"
            />
          </div>

          {/* Photos */}
          <div className="form-group">
            <label>사진 첨부 ({totalPhotos}/5)</label>
            <div className="photo-upload-area">
              {/* Existing files */}
              {existingFiles.map((f) => (
                <div key={f.file_id} className="photo-preview">
                  <img src={getFileUrl(f.file_path)} alt={f.file_name} />
                  <button
                    type="button"
                    className="photo-remove"
                    onClick={() => handleRemoveExistingFile(f.file_id)}
                  >
                    &times;
                  </button>
                </div>
              ))}

              {/* New files */}
              {filePreviews.map((preview, i) => (
                <div key={i} className="photo-preview">
                  <img src={preview} alt={`New ${i + 1}`} />
                  <button
                    type="button"
                    className="photo-remove"
                    onClick={() => handleRemoveNewFile(i)}
                  >
                    &times;
                  </button>
                </div>
              ))}

              {/* Add button */}
              {totalPhotos < 5 && (
                <label className="photo-add-btn">
                  <span>+</span>
                  <span>사진 추가</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    multiple
                    style={{ display: 'none' }}
                    onChange={handleFileAdd}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
            <button
              type="button"
              className="btn btn-secondary btn-lg"
              onClick={() => navigate(-1)}
            >
              취소
            </button>
            <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
              {saving ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
