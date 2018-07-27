import { Component } from '@angular/core';
import { NavController, Platform, LoadingController } from 'ionic-angular';
import { File } from '@ionic-native/file';
import { DocumentViewer, DocumentViewerOptions } from '@ionic-native/document-viewer';
import { FileTransfer } from '@ionic-native/file-transfer';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

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

}
