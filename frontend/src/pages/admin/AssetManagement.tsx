import { useState, useEffect, useCallback } from 'react';
import { getAssets, createAsset, updateAsset, deleteAsset, downloadAssetsExcel } from '../../api/client';
import type { Asset, AssetCreateRequest } from '../../types';
import Loading from '../../components/Loading';
import ConfirmDialog from '../../components/ConfirmDialog';

const emptyForm: AssetCreateRequest = {
  asset_no: '',
  asset_name: '',
  category: '',
  location_building: '',
  location_floor: '',
  location_room: '',
  rack_position: '',
  ip_address: '',
  serial_no: '',
  status: '운영중',
};

export default function AssetManagement() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [form, setForm] = useState<AssetCreateRequest>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Asset | null>(null);

  const loadAssets = useCallback(async (searchTerm?: string) => {
    try {
      setLoading(true);
      const data = await getAssets(searchTerm);
      setAssets(data);
    } catch {
      setError('자산 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  const handleSearch = () => {
    loadAssets(search || undefined);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const openCreate = () => {
    setEditingAsset(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setForm({
      asset_no: asset.asset_no,
      asset_name: asset.asset_name,
      category: asset.category,
      location_building: asset.location_building,
      location_floor: asset.location_floor,
      location_room: asset.location_room,
      rack_position: asset.rack_position,
      ip_address: asset.ip_address,
      serial_no: asset.serial_no,
      status: asset.status,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.asset_no.trim() || !form.asset_name.trim()) {
      setError('자산번호와 장비명은 필수 항목입니다.');
      return;
    }
    try {
      setError('');
      if (editingAsset) {
        await updateAsset(editingAsset.asset_id, form);
      } else {
        await createAsset(form);
      }
      setShowForm(false);
      await loadAssets(search || undefined);
    } catch (err: any) {
      setError(err.response?.data?.message || '저장에 실패했습니다.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setError('');
      await deleteAsset(deleteTarget.asset_id);
      setDeleteTarget(null);
      await loadAssets(search || undefined);
    } catch (err: any) {
      setError(err.response?.data?.message || '삭제에 실패했습니다.');
      setDeleteTarget(null);
    }
  };

  const handleExcelDownload = async () => {
    try {
      await downloadAssetsExcel();
    } catch {
      setError('엑셀 다운로드에 실패했습니다.');
    }
  };

  const updateField = (field: keyof AssetCreateRequest, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  if (loading && assets.length === 0) return <Loading />;

  return (
    <div>
      <div className="page-header">
        <h2>자산 관리</h2>
        <div className="page-toolbar">
          <div className="search-box">
            <input
              className="form-control"
              placeholder="자산번호 또는 장비명 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
          </div>
          <button className="btn btn-secondary" onClick={handleSearch}>검색</button>
          <button className="btn btn-secondary" onClick={handleExcelDownload}>Excel 다운로드</button>
          <button className="btn btn-primary" onClick={openCreate}>+ 자산 등록</button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="card">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>자산번호</th>
                <th>장비명</th>
                <th>분류</th>
                <th>위치</th>
                <th>IP</th>
                <th>시리얼번호</th>
                <th>상태</th>
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              {assets.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-gray-400)' }}>
                    {search ? '검색 결과가 없습니다.' : '등록된 자산이 없습니다.'}
                  </td>
                </tr>
              ) : (
                assets.map((a) => (
                  <tr key={a.asset_id}>
                    <td style={{ fontWeight: 600 }}>{a.asset_no}</td>
                    <td>{a.asset_name}</td>
                    <td>{a.category}</td>
                    <td style={{ fontSize: '0.8125rem' }}>
                      {[a.location_building, a.location_floor, a.location_room].filter(Boolean).join(' ')}
                      {a.rack_position ? ` (${a.rack_position})` : ''}
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}>{a.ip_address}</td>
                    <td style={{ fontSize: '0.8125rem' }}>{a.serial_no}</td>
                    <td>{a.status}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-sm btn-secondary" onClick={() => openEdit(a)}>수정</button>
                        <button className="btn btn-sm btn-danger" onClick={() => setDeleteTarget(a)}>삭제</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" style={{ maxWidth: 600 }} onClick={(e) => e.stopPropagation()}>
            <h2>{editingAsset ? '자산 수정' : '자산 등록'}</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
                <div className="form-group">
                  <label>자산번호 *</label>
                  <input
                    className="form-control"
                    value={form.asset_no}
                    onChange={(e) => updateField('asset_no', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>장비명 *</label>
                  <input
                    className="form-control"
                    value={form.asset_name}
                    onChange={(e) => updateField('asset_name', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>분류</label>
                  <select
                    className="form-control"
                    value={form.category}
                    onChange={(e) => updateField('category', e.target.value)}
                  >
                    <option value="">선택</option>
                    <option value="스위치">스위치</option>
                    <option value="서버">서버</option>
                    <option value="AP">AP</option>
                    <option value="라우터">라우터</option>
                    <option value="방화벽">방화벽</option>
                    <option value="기타">기타</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>운영상태</label>
                  <select
                    className="form-control"
                    value={form.status}
                    onChange={(e) => updateField('status', e.target.value)}
                  >
                    <option value="운영중">운영중</option>
                    <option value="보관">보관</option>
                    <option value="폐기">폐기</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>건물</label>
                  <input
                    className="form-control"
                    value={form.location_building}
                    onChange={(e) => updateField('location_building', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>층</label>
                  <input
                    className="form-control"
                    value={form.location_floor}
                    onChange={(e) => updateField('location_floor', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>실/공간</label>
                  <input
                    className="form-control"
                    value={form.location_room}
                    onChange={(e) => updateField('location_room', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>랙 위치</label>
                  <input
                    className="form-control"
                    value={form.rack_position}
                    onChange={(e) => updateField('rack_position', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>관리 IP</label>
                  <input
                    className="form-control"
                    value={form.ip_address}
                    onChange={(e) => updateField('ip_address', e.target.value)}
                    placeholder="192.168.0.1"
                  />
                </div>
                <div className="form-group">
                  <label>시리얼번호</label>
                  <input
                    className="form-control"
                    value={form.serial_no}
                    onChange={(e) => updateField('serial_no', e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                  취소
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingAsset ? '수정' : '등록'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="자산 삭제"
        message={`"${deleteTarget?.asset_no} - ${deleteTarget?.asset_name}" 자산을 삭제하시겠습니까?`}
        confirmLabel="삭제"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
