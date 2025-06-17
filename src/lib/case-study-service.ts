import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { CaseStudy } from '@/types/case-study'
import { v4 as uuidv4 } from 'uuid'

const COLLECTION_NAME = 'caseStudies'

export const caseStudyService = {
  // Crea un nuovo case study
  async create(
    userId: string, 
    formData: CaseStudy['formData'],
    orgId?: string
  ): Promise<string> {
    const id = uuidv4()
    const caseStudy: any = {
      userId,
      createdBy: userId,
      status: 'draft',
      formData,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Only add orgId if it's provided (avoid undefined values in Firestore)
    if (orgId) {
      caseStudy.orgId = orgId
    }

    await setDoc(doc(db, COLLECTION_NAME, id), {
      ...caseStudy,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })

    return id
  },

  // Aggiorna un case study esistente
  async update(id: string, formData: Partial<CaseStudy['formData']>): Promise<void> {
    await updateDoc(doc(db, COLLECTION_NAME, id), {
      formData,
      updatedAt: serverTimestamp()
    })
  },

  // Ottieni un singolo case study
  async getById(id: string): Promise<CaseStudy | null> {
    const docSnap = await getDoc(doc(db, COLLECTION_NAME, id))
    
    if (docSnap.exists()) {
      const data = docSnap.data()
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as CaseStudy
    }
    
    return null
  },

  // Ottieni tutti i case study di un utente o organizzazione
  async getByUserId(userId: string, orgId?: string): Promise<CaseStudy[]> {
    let q;
    
    if (orgId) {
      // Get all case studies for the organization
      q = query(
        collection(db, COLLECTION_NAME),
        where('orgId', '==', orgId),
        orderBy('updatedAt', 'desc')
      )
    } else {
      // Get personal case studies (user's case studies regardless of orgId)
      // This is more compatible with existing data that might not have orgId field
      q = query(
        collection(db, COLLECTION_NAME),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      )
    }
    
    const querySnapshot = await getDocs(q)
    const caseStudies: CaseStudy[] = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      caseStudies.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as CaseStudy)
    })
    
    return caseStudies
  },

  // Pubblica un case study
  async publish(id: string): Promise<void> {
    await updateDoc(doc(db, COLLECTION_NAME, id), {
      status: 'published',
      updatedAt: serverTimestamp()
    })
  },

  // Torna a bozza
  async unpublish(id: string): Promise<void> {
    await updateDoc(doc(db, COLLECTION_NAME, id), {
      status: 'draft',
      updatedAt: serverTimestamp()
    })
  },

  // Elimina un case study
  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION_NAME, id))
  },

  // Salva automaticamente (per autosave)
  async autoSave(id: string, formData: CaseStudy['formData']): Promise<void> {
    await updateDoc(doc(db, COLLECTION_NAME, id), {
      formData,
      updatedAt: serverTimestamp()
    })
  }
}