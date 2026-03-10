def snapshot_models():
    """Pre-load US tax-benefit system at image build time for fast cold starts."""
    import logging

    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)
    logger.info("Pre-loading US tax-benefit system...")
    from policyengine_us import CountryTaxBenefitSystem

    CountryTaxBenefitSystem()
    logger.info("Models pre-loaded into image snapshot")
