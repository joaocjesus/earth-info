<script>
  import { toast } from './stores.js';
</script>

<div class="toast" class:visible={$toast.visible}>{$toast.message}</div>

<style>
  .toast {
    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
    background: rgba(20, 26, 40, 0.96);
    border: 1px solid rgba(255,120,120,0.4);
    color: #ffb4b4; padding: 12px 18px; border-radius: 10px;
    font-size: 13px; z-index: 20; opacity: 0;
    transition: opacity .2s; pointer-events: none;
    max-width: 80vw; text-align: center;
  }
  .toast.visible { opacity: 1; }
</style>
