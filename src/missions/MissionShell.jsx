// 미션 창 공통 틀: 머리글(맵 · 미션 이름 · 단계), 본문, 피드백 줄
export default function MissionShell({ place, title, step, total, feedback, tone = 'info', onClose, children }) {
  return (
    <div className="modal-bg">
      <div className="mission" role="dialog" aria-modal="true" aria-labelledby="mission-title">
        <div className="mission-head">
          <div>
            <span className="mission-place">{place}</span>
            <h2 id="mission-title">{title}</h2>
          </div>
          {total ? (
            <ol className="steps" aria-label={step > total ? `${total}단계 모두 완료` : `${total}단계 중 ${step}단계`}>
              {Array.from({ length: total }).map((_, i) => (
                <li key={i} className={i + 1 < step ? 'done' : i + 1 === step ? 'now' : ''}>{i + 1}</li>
              ))}
            </ol>
          ) : null}
          {onClose && (
            <button className="close" onClick={onClose} aria-label="미션 닫기">×</button>
          )}
        </div>
        <div className="mission-body">{children}</div>
        <p className={`feedback ${tone}`} aria-live="polite">{feedback}</p>
      </div>
    </div>
  )
}
