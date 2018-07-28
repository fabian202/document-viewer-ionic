import { Component, ElementRef, ViewChild } from '@angular/core';
import { NavController, Platform, LoadingController } from 'ionic-angular';
import { File } from '@ionic-native/file';
import { DocumentViewer, DocumentViewerOptions } from '@ionic-native/document-viewer';
import { FileTransfer } from '@ionic-native/file-transfer';

//Solo pdf manual
import * as PDFJS from "pdfjs-dist/webpack.js";
import { PDFPageProxy, PDFPageViewport, PDFRenderTask } from 'pdfjs-dist';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  pdfDocument: PDFJS.PDFDocumentProxy;
    PDFJSViewer = PDFJS;
    pageContainerUnique = {
        width: 0 as number,
        height: 0 as number,
        element: null as HTMLElement,
        canvas: null as HTMLCanvasElement,
        textContainer: null as HTMLElement,
        canvasWrapper: null as HTMLElement
    }
    @ViewChild('pageContainer') pageContainerRef: ElementRef;
    @ViewChild('viewer') viewerRef: ElementRef;
    @ViewChild('canvas') canvasRef: ElementRef;
    @ViewChild('canvasWrapper') canvasWrapperRef: ElementRef;
    @ViewChild('textContainer') textContainerRef: ElementRef;

    pages: number = 0;
    actualPage: number = 0;


  constructor(public navCtrl: NavController, private document: DocumentViewer, private file: File, private transfer: FileTransfer, private platform: Platform, public loadingCtrl: LoadingController) { }


  open() {
    let loading = this.loadingCtrl.create({
      content: 'Espere...'
    });

    console.log('Mostrar loader');

    loading.present();



    let path = null;

    if (this.platform.is('ios')) {
      path = this.file.documentsDirectory;
    } else if (this.platform.is('android')) {
      path = this.file.dataDirectory;
    }

    const options: DocumentViewerOptions = {
      title: 'Titulo',
      openWith: { enabled: true }
    };

    const transfer = this.transfer.create();
    transfer.download('http://gahp.net/wp-content/uploads/2017/09/sample.pdf', path + 'nombre-del-archivo.pdf').then(entry => {
      let url = entry.toURL();
      console.log('Ocultar loader');
      loading.dismiss();
      this.document.viewDocument(url, 'application/pdf', options);
    });
  }

  ionViewDidLoad() {
    this.pageContainerUnique.element = this.pageContainerRef.nativeElement as HTMLElement;
    this.pageContainerUnique.canvasWrapper = this.canvasWrapperRef.nativeElement as HTMLCanvasElement;
    this.pageContainerUnique.canvas = this.canvasRef.nativeElement as HTMLCanvasElement;
    this.pageContainerUnique.textContainer = this.textContainerRef.nativeElement as HTMLCanvasElement;
    this.loadPdf('assets/db.pdf');
}


  openAndroid() {
      this.pageContainerUnique.element = this.pageContainerRef.nativeElement as HTMLElement;
      this.pageContainerUnique.canvasWrapper = this.canvasWrapperRef.nativeElement as HTMLCanvasElement;
      this.pageContainerUnique.canvas = this.canvasRef.nativeElement as HTMLCanvasElement;
      this.pageContainerUnique.textContainer = this.textContainerRef.nativeElement as HTMLCanvasElement;
      this.loadPdf('assets/sample.pdf');
  }

  loadPdf(pdfPath: string): Promise<boolean> {

    let loading = this.loadingCtrl.create({
      content: 'Espere...'
    });

    console.log('Mostrar loader');

    loading.present();

    return this.PDFJSViewer.getDocument(pdfPath)
        .then(pdf => {
            this.pdfDocument = pdf;
            console.log("pdf loaded:", pdf.numPages); console.dir(this.pdfDocument);
            this.pages = pdf.numPages;
            this.actualPage = 1;
            return this.loadPage(this.actualPage);
        }).then((pdfPage) => {
            console.dir(pdfPage);
            loading.dismiss();
        }).catch(e => {
            console.error(e);
            return false;
        });
  }

  loadPage(pageNum: number = 1) {
      let pdfPage: PDFPageProxy;

      return this.pdfDocument.getPage(pageNum).then(thisPage => {
          pdfPage = thisPage;
          return this.renderOnePage(pdfPage);
      }).then(() => {
          return pdfPage;
      });

  } // loadpage()

  async renderOnePage(pdfPage: PDFPageProxy) {

      let textContainer: HTMLElement;
      let canvas: HTMLCanvasElement;
      let wrapper: HTMLElement;

      let canvasContext: CanvasRenderingContext2D;
      let page: HTMLElement

      page = this.pageContainerUnique.element;
      textContainer = this.pageContainerUnique.textContainer;
      canvas = this.pageContainerUnique.canvas;
      wrapper = this.pageContainerUnique.canvasWrapper;

      canvasContext = canvas.getContext('2d') as CanvasRenderingContext2D;
      canvasContext.imageSmoothingEnabled = false;
      canvasContext.webkitImageSmoothingEnabled = false;
      canvasContext.mozImageSmoothingEnabled = false;
      canvasContext.oImageSmoothingEnabled = false;

      let viewport = pdfPage.getViewport(1) as PDFPageViewport;

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      page.style.width = `${viewport.width}px`;
      page.style.height = `${viewport.height}px`;
      wrapper.style.width = `${viewport.width}px`;
      wrapper.style.height = `${viewport.height}px`;
      textContainer.style.width = `${viewport.width}px`;
      textContainer.style.height = `${viewport.height}px`;

      //fix for 4K


      if (window.devicePixelRatio > 1) {
          let canvasWidth = canvas.width;
          let canvasHeight = canvas.height;

          canvas.width = canvasWidth * window.devicePixelRatio;
          canvas.height = canvasHeight * window.devicePixelRatio;
          canvas.style.width = canvasWidth + "px";
          canvas.style.height = canvasHeight + "px";

          canvasContext.scale(window.devicePixelRatio, window.devicePixelRatio);
      }

      // THIS RENDERS THE PAGE !!!!!!


      let renderTask: PDFRenderTask = pdfPage.render({
          canvasContext,
          viewport
      });

      let container = textContainer;

      return renderTask.then(() => {
          //console.error("I WORK JUST UNTIL HERE");


          return pdfPage.getTextContent();

      }).then((textContent) => {

          let textLayer: HTMLElement;


          textLayer = this.pageContainerUnique.textContainer


          while (textLayer.lastChild) {
              textLayer.removeChild(textLayer.lastChild);
          }

          this.PDFJSViewer.renderTextLayer({
              textContent,
              container,
              viewport,
              textDivs: []
          });

          return true;
      });
  }

  nextPaginini() {
    this.actualPage++;
    this.loadPage(this.actualPage);
  }

  backPaginini() {
    this.actualPage--;
    this.loadPage(this.actualPage);
  }

}
