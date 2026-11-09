function drawText(ctx: CanvasRenderingContext2D, table: HTMLTableElement, bounds: DOMRect) {
    const walker = document.createTreeWalker(table, NodeFilter.SHOW_TEXT);
    const range = document.createRange();
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const text = node.textContent ?? '';
        if (!text.trim() || !node.parentElement) continue;

        const style = getComputedStyle(node.parentElement);
        ctx.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
        ctx.fillStyle = style.color;
        const metrics = ctx.measureText(text);
        const centerToBaseline = (metrics.fontBoundingBoxAscent - metrics.fontBoundingBoxDescent) / 2;
        const drawRun = (value: string, rect: DOMRect) => {
            ctx.fillText(value.trim(), rect.left - bounds.left, rect.top + rect.height / 2 - bounds.top + centerToBaseline);
        };

        range.selectNodeContents(node);
        if (range.getClientRects().length <= 1) {
            // The DOM may collapse leading spaces in a text node at a line break.
            // Select the visible text so its left edge is correct in either case.
            range.setStart(node, text.length - text.trimStart().length);
            range.setEnd(node, text.trimEnd().length);
            drawRun(text, range.getBoundingClientRect());
            continue;
        }

        let start = 0;
        let end = 0;
        let lineTop: number | undefined;
        const drawLine = () => {
            const line = text.slice(start, end);
            if (!line.trim()) return;
            range.setStart(node, start + line.length - line.trimStart().length);
            range.setEnd(node, start + line.trimEnd().length);
            drawRun(line, range.getBoundingClientRect());
        };
        for (const char of text) {
            range.setStart(node, end);
            range.setEnd(node, end + char.length);
            const top = range.getBoundingClientRect().top;
            if (lineTop !== undefined && top !== lineTop) {
                drawLine();
                start = end;
            }
            lineTop = top;
            end += char.length;
        }
        drawLine();
    }
}

export async function rankingTablePng(table: HTMLTableElement): Promise<Blob> {
    await document.fonts.ready;
    const bounds = table.getBoundingClientRect();
    const canvas = document.createElement('canvas');
    const scale = 2;
    canvas.width = Math.ceil(bounds.width * scale);
    canvas.height = Math.ceil(bounds.height * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx || !canvas.width || !canvas.height) throw new Error('Brak obrazu tabeli.');

    ctx.scale(scale, scale);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, bounds.width, bounds.height);

    const drawBorder = (x: number, y: number, endX: number, endY: number, width: string, color: string, style: string) => {
        const lineWidth = parseFloat(width);
        if (!lineWidth) return;
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = color;
        ctx.setLineDash(style === 'dotted' ? [ctx.lineWidth, ctx.lineWidth] : []);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(endX, endY);
        ctx.stroke();
    };
    for (const row of table.rows) {
        const rect = row.getBoundingClientRect();
        ctx.fillStyle = getComputedStyle(row).backgroundColor;
        ctx.fillRect(rect.left - bounds.left, rect.top - bounds.top, rect.width, rect.height);
    }
    for (const row of table.rows) {
        const rect = row.getBoundingClientRect();
        const style = getComputedStyle(row);
        const left = rect.left - bounds.left;
        const top = rect.top - bounds.top;
        const bottom = rect.bottom - bounds.top;
        for (const cell of Array.from(row.cells).slice(0, -1)) {
            const right = cell.getBoundingClientRect().right - bounds.left;
            const border = getComputedStyle(cell);
            drawBorder(right, top, right, bottom, border.borderRightWidth, border.borderRightColor, border.borderRightStyle);
        }
        drawBorder(left, bottom, rect.right - bounds.left, bottom, style.borderBottomWidth, style.borderBottomColor, style.borderBottomStyle);
    }
    drawText(ctx, table, bounds);

    const border = getComputedStyle(table);
    const borderWidth = parseFloat(border.borderTopWidth);
    ctx.setLineDash([]);
    ctx.lineWidth = borderWidth;
    ctx.strokeStyle = border.borderTopColor;
    ctx.strokeRect(borderWidth / 2, borderWidth / 2, bounds.width - borderWidth, bounds.height - borderWidth);

    return new Promise((resolve, reject) => canvas.toBlob(blob => {
        if (blob) resolve(blob);
        else reject(new Error('Nie udało się utworzyć PNG.'));
    }, 'image/png'));
}
