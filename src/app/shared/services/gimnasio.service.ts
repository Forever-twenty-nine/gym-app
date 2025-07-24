import { Injectable, inject } from '@angular/core';
import { Firestore, collection, query, where, getDocs } from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class GimnasioService {
  private firestore = inject(Firestore);
  private readonly entrenadoresCollection = 'entrenadores';
  private readonly usersCollection = 'users';

  async getEntrenadoresPorGimnasio(gimnasioId: string): Promise<Array<{ id: string; nombre: string; email: string }>> {
    // 1. Obtener los IDs de los entrenadores asociados al gimnasio
    const entrenadoresRef = collection(this.firestore, this.entrenadoresCollection);
    const q = query(entrenadoresRef, where('gimnasioId', '==', gimnasioId));
    const snapshot = await getDocs(q);
    const entrenadorIds = snapshot.docs.map(doc => doc.data()['userId']);

    // 2. Consultar la colección users para traer los datos completos
    const usersRef = collection(this.firestore, this.usersCollection);
    const usersQ = query(usersRef, where('id', 'in', entrenadorIds));
    const usersSnap = await getDocs(usersQ);
    return usersSnap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        nombre: data['nombre'],
        email: data['email']
      };
    });
  }
}
