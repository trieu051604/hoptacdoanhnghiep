import { qnCareerData } from './mock-data.js';
import { createPartnerCarousel } from './partner-carousel.js?v=20261016-4';

(() => {
    'use strict';
    const initialize = () => {
      const root = document.getElementById('fpt-qn-career');
      if (!root) return;
      const query = selector => root.querySelector(selector);
      const fallback = new URL('../images/fallback.svg', import.meta.url).href;
      const dialog = query('[data-qn-dialog]');
      const dialogContent = query('[data-qn-dialog-content]');
      const searchInput = query('#qn-job-search');
      const locationSelect = query('[data-qn-location]');
      const partnerTrack = query('[data-qn-partners]');
      const partnerCarousel = createPartnerCarousel(root);
      const labels = { internship: 'Thực tập', fresher: 'Fresher', fulltime: 'Toàn thời gian', program: 'Chương trình' };
      const pageSize = 8;
      const state = { data: {}, search: '', location: 'all', sort: 'newest', page: 1, pageCount: 1, error: false };
      let previousFocus;
      let restoreFocus = true;
      let searchTimer;
      const string = value => value == null ? '' : String(value);
      const escape = value => string(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
      const array = value => Array.isArray(value) ? value.filter(item => item && typeof item === 'object' && !Array.isArray(item)) : [];
      const safeUrl = (value, defaultValue = '#jobs') => {
        const candidate = string(value).trim();
        if (!candidate || /[\u0000-\u0020\u007f\\]/.test(candidate)) return defaultValue;
        if (candidate.startsWith('//') || /^[a-z][a-z0-9+.-]*:/i.test(candidate) && !/^https?:\/\//i.test(candidate)) return defaultValue;
        return candidate;
      };
      const image = (source, alt, className = '', width = 800, height = 450) => `<img src="${escape(safeUrl(source, fallback))}" alt="${escape(alt)}" class="${className}" width="${width}" height="${height}" loading="lazy" decoding="async">`;
      const normalize = value => string(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
      const validDate = value => {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(string(value))) return false;
        const parsed = new Date(`${value}T12:00:00Z`);
        return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
      };
      const dateMarkup = value => {
        if (!validDate(value)) return '<span>Đang cập nhật</span>';
        const date = new Date(`${value}T12:00:00+07:00`);
        const full = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' });
        const now = new Date();
        const today = new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' }).format(now);
        const days = Math.round((new Date(`${today}T12:00:00+07:00`) - date) / 86400000);
        const display = days === 0 ? 'Hôm nay' : days === 1 ? 'Hôm qua' : days > 1 && days <= 7 ? `${days} ngày trước` : full;
        return `<time datetime="${escape(value)}" title="${escape(full)}">${escape(display)}</time>`;
      };
      const details = (record, kind) => record.isMock === true ? ` data-qn-detail="${escape(record.id)}" data-qn-kind="${kind}"` : '';
      const link = (record, kind, text, className = '') => `<a class="${className}" href="${escape(safeUrl(record.permalink))}"${details(record, kind)}>${text}</a>`;
      const empty = (title, description) => `<div class="qn-empty-state"><strong>${escape(title)}</strong><p>${escape(description)}</p></div>`;
      const icons = {
        location: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>',
        clock: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>'
      };
      const entries = () => [
        ...array(state.data.jobs).map(record => ({ record, kind: 'jobs' })),
        ...array(state.data.recruitmentPrograms).map(record => ({ record, kind: 'recruitmentPrograms' }))
      ];
      const scrollToJobs = () => {
        const target = query('#jobs');
        target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
        target.focus({ preventScroll: true });
      };

      const renderPagination = () => {
        const navigation = query('[data-qn-pagination]');
        navigation.hidden = state.error || state.pageCount <= 1;
        if (navigation.hidden) { navigation.innerHTML = ''; return; }
        const button = (page, label, content, current = false, disabled = false) => `<button class="qn-page-button" type="button" data-qn-page="${page}" aria-label="${label}" aria-controls="qn-job-list"${current ? ' aria-current="page"' : ''}${disabled ? ' disabled' : ''}>${content}</button>`;
        const first = Math.max(1, Math.min(state.page - 2, state.pageCount - 4));
        const last = Math.min(state.pageCount, first + 4);
        const controls = [button(state.page - 1, 'Trang trước', '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5 M11 6l-6 6 6 6"/></svg>', false, state.page === 1)];
        for (let page = first; page <= last; page++) controls.push(button(page, `Trang ${page}`, page, page === state.page));
        controls.push(button(state.page + 1, 'Trang tiếp theo', '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14 M13 6l6 6-6 6"/></svg>', false, state.page === state.pageCount));
        navigation.innerHTML = controls.join('');
      };
      const render = () => {
        const filtered = entries().filter(({ record }) =>
          (state.location === 'all' || string(record.location).trim() === state.location) &&
          normalize(`${string(record.title)} ${string(record.excerpt)} ${string(record.company)} ${string(record.location)} ${Array.isArray(record.skills) ? record.skills.join(' ') : ''}`).includes(normalize(state.search))
        );
        filtered.sort((a, b) => {
          if (state.sort === 'company') return string(a.record.company).localeCompare(string(b.record.company), 'vi');
          const left = validDate(a.record.publishedDate) ? a.record.publishedDate : '';
          const right = validDate(b.record.publishedDate) ? b.record.publishedDate : '';
          if (!left || !right) return left ? -1 : right ? 1 : 0;
          return state.sort === 'oldest' ? left.localeCompare(right) : right.localeCompare(left);
        });
        state.pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
        state.page = Math.max(1, Math.min(state.page, state.pageCount));
        const offset = (state.page - 1) * pageSize;
        const visible = filtered.slice(offset, offset + pageSize);
        const container = query('[data-qn-jobs]');
        if (state.error) container.innerHTML = empty('Chưa thể tải thông tin tuyển dụng', 'Vui lòng quay lại sau để cập nhật thông tin mới nhất.');
        else if (!filtered.length) container.innerHTML = state.search || state.location !== 'all' ? empty('Không tìm thấy thông tin phù hợp', 'Thử từ khóa khác hoặc đổi địa điểm để tiếp tục khám phá.') : empty('Chưa có thông tin tuyển dụng', 'Các vị trí và chương trình tuyển dụng mới sẽ được cập nhật tại đây.');
        else container.innerHTML = visible.map(({ record, kind }) => {
          const title = record.title || 'Thông tin tuyển dụng đang cập nhật';
          return `<article class="qn-job-item">
            <div class="qn-media">${image(record.thumbnail, record.thumbnailAlt || `Ảnh minh họa: ${string(title)}`)}
              <span class="qn-card-published"><span class="qn-sr-only">Ngày đăng: </span>${icons.clock}${dateMarkup(record.publishedDate)}</span>
            </div>
            <div class="qn-job-content">
              <div class="qn-company-row"><span class="qn-company-logo">${image(record.companyLogo, '', '', 96, 80)}</span><span class="qn-card-company">${escape(record.company || 'FPT University Quy Nhơn')}</span></div>
              <h3 class="qn-line-clamp">${link(record, kind, escape(title))}</h3>
              <p class="qn-job-excerpt qn-line-clamp">${escape(record.excerpt || 'Thông tin chi tiết đang được cập nhật.')}</p>
              <div class="qn-job-meta"><span>${icons.location}${escape(record.location || 'Đang cập nhật')}</span></div>
            </div>
            ${link(record, kind, 'Xem chi tiết <span aria-hidden="true">→</span><span class="qn-sr-only">: ' + escape(title) + '</span>', 'qn-text-link')}
          </article>`;
        }).join('');
        renderPagination();
        query('[data-qn-results]').innerHTML = state.error ? 'Đang cập nhật' : `Hiển thị <strong>${filtered.length} cơ hội</strong><span class="qn-sr-only">${filtered.length ? `, kết quả ${offset + 1}–${offset + visible.length}` : ''}</span>`;
      };

      const renderPartners = () => {
        const records = array(state.data.partners);
        query('[data-qn-partner-section]').hidden = records.length === 0;
        partnerTrack.innerHTML = records.map(record => {
          const content = image(record.logo, record.showName ? '' : record.name || 'Doanh nghiệp', '', 200, 100) + (record.showName ? `<span class="qn-partner-name">${escape(record.name)}</span>` : '');
          const attributes = `class="qn-partner${record.showName ? ' qn-partner-with-name' : ''}" data-qn-brand="${escape(record.id)}"`;
          return record.url ? `<a ${attributes} href="${escape(safeUrl(record.url))}">${content}</a>` : `<div ${attributes}>${content}</div>`;
        }).join('');
        partnerCarousel.refresh();
      };
      const renderLocations = () => {
        const locations = [...new Set(entries().map(({ record }) => string(record.location).trim()).filter(Boolean))];
        if (!locations.includes(state.location)) state.location = 'all';
        locationSelect.innerHTML = '<option value="all">Tất cả địa điểm</option>' + locations.map(location => `<option value="${escape(location)}"${state.location === location ? ' selected' : ''}>${escape(location)}</option>`).join('');
      };
      const applyData = data => {
        state.data = data && typeof data === 'object' && !Array.isArray(data) ? data : {};
        state.page = 1;
        state.error = false;
        renderLocations();
        render();
        renderPartners();
      };
      const closeDialog = (restore = true) => { restoreFocus = restore; if (dialog.open) dialog.close(); };
      const showDetail = (kind, id) => {
        if (!['jobs', 'recruitmentPrograms'].includes(kind)) return;
        const record = array(state.data[kind]).find(item => string(item.id) === id);
        if (!record) return;
        const list = (title, items) => Array.isArray(items) && items.length ? `<h3>${title}</h3><ul>${items.map(item => `<li>${escape(item)}</li>`).join('')}</ul>` : '';
        restoreFocus = true;
        previousFocus = root.contains(document.activeElement) ? document.activeElement : null;
        dialogContent.innerHTML = `${image(record.thumbnail, record.thumbnailAlt || record.title || 'Ảnh minh họa tuyển dụng', 'qn-dialog-image')}
          <h2 id="qn-dialog-title">${escape(record.title || 'Thông tin tuyển dụng')}</h2>
          <div class="qn-dialog-meta"><span class="qn-tag">${escape(kind === 'recruitmentPrograms' ? labels.program : labels[record.category] || record.category || 'Tuyển dụng')}</span>${dateMarkup(record.publishedDate)}${record.company ? `<span>${escape(record.company)}</span>` : ''}${record.location ? `<span>${escape(record.location)}</span>` : ''}</div>
          <p>${escape(record.excerpt || 'Thông tin đang được cập nhật.')}</p>
          ${list('Mô tả công việc', record.responsibilities)}${list('Yêu cầu', record.requirements)}${list('Kỹ năng', record.skills)}
          <a class="qn-button qn-button-outline" href="#jobs" data-qn-dialog-anchor>Về danh sách tuyển dụng <span aria-hidden="true">→</span></a>`;
        dialog.showModal();
        query('[data-qn-close]').focus();
      };

      root.addEventListener('click', event => {
        if (!(event.target instanceof Element)) return;
        const detail = event.target.closest('[data-qn-detail]');
        if (detail && !event.ctrlKey && !event.metaKey && !event.shiftKey && event.button === 0) {
          event.preventDefault(); showDetail(detail.dataset.qnKind, detail.dataset.qnDetail); return;
        }
        const pageButton = event.target.closest('[data-qn-page]');
        if (pageButton) {
          const page = Number(pageButton.dataset.qnPage);
          if (!Number.isInteger(page) || page < 1 || page > state.pageCount || page === state.page || pageButton.disabled) return;
          state.page = page; render(); scrollToJobs(); return;
        }
        const carouselButton = event.target.closest('[data-qn-partner-direction]');
        if (carouselButton) {
          partnerCarousel.move(Number(carouselButton.dataset.qnPartnerDirection));
          return;
        }
        if (event.target.closest('[data-qn-close]')) { closeDialog(); return; }
        const anchor = event.target.closest('a[href="#jobs"]');
        if (anchor && !event.ctrlKey && !event.metaKey && !event.shiftKey && event.button === 0) {
          event.preventDefault();
          if (anchor.hasAttribute('data-qn-dialog-anchor')) closeDialog(false);
          scrollToJobs();
        }
      });
      query('.qn-search').addEventListener('submit', event => {
        event.preventDefault();
        clearTimeout(searchTimer);
        state.search = searchInput.value.trim(); state.page = 1;
        render(); scrollToJobs();
      });
      searchInput.addEventListener('input', () => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => { state.search = searchInput.value.trim(); state.page = 1; render(); }, 120);
      });
      locationSelect.addEventListener('change', () => { state.location = locationSelect.value; state.page = 1; render(); });
      query('[data-qn-sort]').addEventListener('change', event => { state.sort = ['newest', 'oldest', 'company'].includes(event.target.value) ? event.target.value : 'newest'; state.page = 1; render(); });
      dialog.addEventListener('click', event => {
        if (event.target !== dialog) return;
        const bounds = dialog.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeDialog();
      });
      dialog.addEventListener('close', () => { if (restoreFocus && previousFocus?.isConnected) previousFocus.focus({ preventScroll: true }); });
      root.addEventListener('error', event => {
        const target = event.target;
        if (!(target instanceof HTMLImageElement) || target.dataset.qnFallback) return;
        target.dataset.qnFallback = 'true'; target.removeAttribute('srcset'); target.src = fallback;
      }, true);
      root.addEventListener('qn:career-data', event => applyData(event.detail));
      root.addEventListener('qn:career-error', () => { state.error = true; render(); });
      applyData(qnCareerData);
      root.dispatchEvent(new CustomEvent('qn:career-ready'));
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
    else initialize();
  })();
