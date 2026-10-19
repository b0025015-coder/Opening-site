/**
 * オープニングメッセージのフェードインアニメーション制御
 */
document.addEventListener('DOMContentLoaded', () => {
  const messageWrapper = document.getElementById('messageWrapper');
  if (!messageWrapper) return;

  // 次の描画フレームでクラスを付与し、滑らかなフェードインを開始
  requestAnimationFrame(() => {
    messageWrapper.classList.add('is-visible');
  });
});
