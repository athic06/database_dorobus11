import Portrait from '../components/Portraits.jsx'

// 개발 서버 전용: 대화창 초상화를 한눈에 확인하는 페이지 (#/dev/portraits)
const WHO = ['자일로', '제로', '리코', '네이티', '코덱스', '???', '일기장', '편지', '상점 주인', '오래된 방문객']

export default function PortraitGallery() {
  return (
    <div className="container" style={{ padding: '24px 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
      {WHO.map((w) => (
        <figure key={w} style={{ margin: 0, textAlign: 'center' }}>
          <div style={{ height: 180, background: '#f6f7fa', borderRadius: 16 }}><Portrait who={w} /></div>
          <figcaption style={{ marginTop: 6, fontWeight: 700 }}>{w}</figcaption>
        </figure>
      ))}
    </div>
  )
}
