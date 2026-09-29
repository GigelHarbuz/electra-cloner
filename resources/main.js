const numIn = document.getElementById('numCode');
const binIn = document.getElementById('binCode');
const preview = document.getElementById('preview');
const scale = 5; 

// cartela de 14 biti are 5 cifre
function updateBin() {
    let b = parseInt(numIn.value).toString(2);
    while(b.length < 12) b = '0' + b;
    binIn.value = b;
    renderPreview();
}

function renderPreview() {
    const bin = binIn.value;
    preview.innerHTML = '';
    
    // keyhole
    let handle = document.createElement('div');
    handle.className = 'p-handle';
    let hole = document.createElement('div');
    hole.className = 'p-hole';
    handle.appendChild(hole);
    preview.appendChild(handle);

    // space between the keyhole and barcode
    let initialGap = document.createElement('div');
    initialGap.className = 'p-bit-gap';
    initialGap.style.height = (2 * scale) + 'px';
    preview.appendChild(initialGap);

    // barcode
    const bits = bin.split('').reverse();
    bits.forEach(bit => {
        let lineLength = bit === '0' ? 2 : 0.75;
        let gapLength = bit === '0' ? 0.25 : 1.25;

        let line = document.createElement('div');
        line.className = 'p-bit-line';
        line.style.height = (lineLength * scale) + 'px';
        line.style.background = bit === '1' ? '#e74c3c' : '#3498db';
        preview.appendChild(line);

        let gap = document.createElement('div');
        gap.className = 'p-bit-gap';
        gap.style.height = (gapLength * scale) + 'px';
        preview.appendChild(gap);
    });

    // top bar
    let detectBar = document.createElement('div');
    detectBar.className = 'p-bar-detect';
    detectBar.style.height = (4 * scale) + 'px';
    preview.appendChild(detectBar);
}

numIn.addEventListener('input', updateBin);
binIn.addEventListener('input', renderPreview);
updateBin();


function downloadSTL() {
    const binStr = binIn.value;
    const bits = binStr.split('').reverse(); 
    
    let stl = "solid electra_v2\n";
    const width = 28;
    const thickness = 5;
    const railW = 2;
    const handleL = 25;
    const initialGap = 12;
    const detectL = 9;

    function addBox(x, y, z, w, l, h) {
        let v = [[x,y,z],[x+w,y,z],[x+w,y+l,z],[x,y+l,z],[x,y,z+h],[x+w,y,z+h],[x+w,y+l,z+h],[x,y+l,z+h]];
        const faces = [[3,2,1,0],[4,5,6,7],[0,1,5,4],[2,3,7,6],[3,0,4,7],[1,2,6,5]];
        faces.forEach(f => {
            let p1=v[f[0]], p2=v[f[1]], p3=v[f[2]], p4=v[f[3]];
            stl += `facet normal 0 0 0\nouter loop\nvertex ${p1[0]} ${p1[1]} ${p1[2]}\nvertex ${p2[0]} ${p2[1]} ${p2[2]}\nvertex ${p3[0]} ${p3[1]} ${p3[2]}\nendloop\nendfacet\n`;
            stl += `facet normal 0 0 0\nouter loop\nvertex ${p1[0]} ${p1[1]} ${p1[2]}\nvertex ${p3[0]} ${p3[1]} ${p3[2]}\nvertex ${p4[0]} ${p4[1]} ${p4[2]}\nendloop\nendfacet\n`;
        });
    }

    // part 1: key hole
    addBox(0, 0, 0, width, 5, thickness); 
    addBox(0, 15, 0, width, 10, thickness);
    addBox(0, 5, 0, 8, 10, thickness);
    addBox(20, 5, 0, 8, 10, thickness);

    // part 2: space between keyhole and barcode (here the reading head shines light trough, when card is inserted if light can't pass, it won't read the card )
    let currentY = handleL + initialGap; 

    // part 3: barcode
    bits.forEach(bit => {
        // spaces measured from a real card
        let lineLength = bit === '0' ? 2 : 0.75;
        let gapLength = bit === '0' ? 0.25 : 1.25;
        
        addBox(railW, currentY, 0, width - 2*railW, lineLength, thickness);
        currentY += lineLength;
        currentY += gapLength;
    });

    // part 4: top bar for IR detection to recognize card is in
    addBox(0, currentY, 0, width, detectL, thickness);

    let totalHeight = currentY + detectL;

    // part 5: lateral rails
    addBox(0, handleL, 0, railW, totalHeight - handleL, thickness);
    addBox(width - railW, handleL, 0, railW, totalHeight - handleL, thickness);

    stl += "endsolid electra_v2";
    
    const blob = new Blob([stl], {type: 'text/plain'});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `cartela_${numIn.value}.stl`;
    link.click();

}
