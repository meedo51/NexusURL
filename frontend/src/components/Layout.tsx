import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation from './layout/Navigation';
import CreateLinkForm from './CreateLinkForm';
import Modal from './ui/Modal';

export default function Layout() {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="min-h-screen bg-[#0A0A1A]">
      <Navigation onNewLink={() => setShowCreateModal(true)} />

      <main className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Link" maxWidth="max-w-xl">
        <CreateLinkForm onSuccess={() => setShowCreateModal(false)} />
      </Modal>
    </div>
  );
}
