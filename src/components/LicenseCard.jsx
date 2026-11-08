import { useStore } from '../store.jsx'

// 챕터 1에서 받는 모바일 로봇 운전면허증. 마이룸에서 받을 때와 월드 HUD의 🪪 버튼으로 본다.
export default function LicenseCard({ onClose, fresh = false }) {
  const { user, progress } = useStore()
  const no = `DR-${user.id.toUpperCase()}-${(progress.licenseDate || '').replaceAll('-', '').slice(2) || '000000'}`
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="license-wrap" onClick={(e) => e.stopPropagation()}>
        {fresh && <p className="license-eyebrow">면허증 발급 완료!</p>}
        <div className="license-card" role="img" aria-label={`${user.name}의 도로랜드 운전면허증`}>
          <div className="lc-head">
            <span>도로랜드 운전면허증</span>
            <span className="lc-badge">D</span>
          </div>
          <div className="lc-body">
            <svg className="lc-photo" viewBox="0 0 80 96" aria-hidden="true">
              <rect width="80" height="96" fill="#D6E4F5" />
              <rect x="38" y="14" width="4" height="12" fill="#5BBF8A" />
              <circle cx="40" cy="13" r="4" fill="#F5C451" />
              <circle cx="40" cy="50" r="24" fill="#5BBF8A" />
              <circle cx="32" cy="48" r="4" fill="#1E2A3A" />
              <circle cx="48" cy="48" r="4" fill="#1E2A3A" />
              <path d="M20 96 C22 78 30 74 40 74 C50 74 58 78 60 96 Z" fill="#4AA878" />
            </svg>
            <dl>
              <dt>이름</dt><dd>{user.name}</dd>
              <dt>종류</dt><dd>모바일 로봇 1종</dd>
              <dt>번호</dt><dd>{no}</dd>
              <dt>발급일</dt><dd>{progress.licenseDate || '-'}</dd>
              <dt>발급</dt><dd>도로랜드 총책임자 자일로</dd>
            </dl>
          </div>
          <p className="lc-foot">자동차 수리 통과: 바퀴 공기압 맞추기, 밸브 뚜껑 끼우기</p>
        </div>
        <button className="btn-primary" onClick={onClose}>{fresh ? '면허증 챙기기' : '닫기'}</button>
      </div>
    </div>
  )
}
