export default function Results({ videos, onPick, onMore, loadingMore }) {
  return (
    <>
      <ol className="results">
        {videos.map((video) => (
          <li key={video.id}>
            <button type="button" onClick={() => onPick(video)}>
              <img
                src={video.thumbnail}
                alt=""
                width="168"
                height="94"
                loading="lazy"
                decoding="async"
              />
              <span className="meta">
                <span className="title">{video.title}</span>
                <span className="channel">{video.channel}</span>
              </span>
            </button>
          </li>
        ))}
      </ol>

      {onMore && (
        <button type="button" className="more" onClick={onMore} disabled={loadingMore}>
          {loadingMore ? 'loading…' : 'more'}
        </button>
      )}
    </>
  )
}
